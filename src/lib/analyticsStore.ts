import fs from 'fs';
import path from 'path';

export interface AnalyticsCounts {
  total_sessions: number;
  total_questions_solved: number;
  total_question_attempts: number;
  contribution_clicks: number;
  email_submissions: number; // Stays 0 when no email mechanism exists
}

export interface AnalyticsStore {
  counts: AnalyticsCounts;
  unique_visitors: string[]; // Hash IDs of unique visitors
  active_sessions: string[]; // Set of session IDs recorded
}

const DATA_DIR = path.join(process.cwd(), 'data');
const ANALYTICS_FILE = path.join(DATA_DIR, 'analytics.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

const DEFAULT_STORE: AnalyticsStore = {
  counts: {
    total_sessions: 0,
    total_questions_solved: 0,
    total_question_attempts: 0,
    contribution_clicks: 0,
    email_submissions: 0,
  },
  unique_visitors: [],
  active_sessions: [],
};

export async function getAnalyticsStore(): Promise<AnalyticsStore> {
  try {
    ensureDataDir();
    if (fs.existsSync(ANALYTICS_FILE)) {
      const data = fs.readFileSync(ANALYTICS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      return {
        counts: { ...DEFAULT_STORE.counts, ...parsed.counts },
        unique_visitors: Array.isArray(parsed.unique_visitors) ? parsed.unique_visitors : [],
        active_sessions: Array.isArray(parsed.active_sessions) ? parsed.active_sessions : [],
      };
    }
  } catch (error) {
    console.error('Error reading analytics.json:', error);
  }
  return DEFAULT_STORE;
}

export type EventType =
  | 'session_start'
  | 'question_attempt'
  | 'question_solved'
  | 'contribution_click'
  | 'email_submission';

export interface EventPayload {
  type: EventType;
  visitor_id?: string;
  session_id?: string;
  metadata?: Record<string, unknown>;
}

export async function recordAnalyticsEvent(event: EventPayload): Promise<void> {
  ensureDataDir();
  const store = await getAnalyticsStore();

  if (event.type === 'session_start') {
    if (event.session_id) {
      if (!store.active_sessions.includes(event.session_id)) {
        store.active_sessions.push(event.session_id);
        store.counts.total_sessions += 1;
        // Cap active_sessions list to last 50,000 to keep file size reasonable
        if (store.active_sessions.length > 50000) {
          store.active_sessions = store.active_sessions.slice(-40000);
        }
      }
    } else {
      store.counts.total_sessions += 1;
    }

    if (event.visitor_id && !store.unique_visitors.includes(event.visitor_id)) {
      store.unique_visitors.push(event.visitor_id);
      if (store.unique_visitors.length > 50000) {
        store.unique_visitors = store.unique_visitors.slice(-40000);
      }
    }
  } else if (event.type === 'question_attempt') {
    store.counts.total_question_attempts += 1;
  } else if (event.type === 'question_solved') {
    store.counts.total_questions_solved += 1;
  } else if (event.type === 'contribution_click') {
    store.counts.contribution_clicks += 1;
  } else if (event.type === 'email_submission') {
    store.counts.email_submissions += 1;
  }

  fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(store, null, 2), 'utf-8');
}
