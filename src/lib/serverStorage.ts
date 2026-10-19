import fs from 'fs';
import path from 'path';
import { fetchJsonFromR2, saveJsonToR2 } from './r2Client';

export interface Supporter {
  id: string;
  name: string;
  comment: string;
  amount: number | string;
  date?: string;
}

export interface ContributionConfig {
  heading: string;
  subtitle: string;
  upi_id: string;
  qr_image_url: string;
  supporters: Supporter[];
}

export interface ContributionPopupConfig {
  enabled: boolean;
  image_url: string;
  button_text: string;
  question_threshold: number;
}

export interface QuestionReport {
  id: string;
  question_id: string;
  branch: string;
  year?: number | string;
  section_name?: string;
  subtopic_name?: string;
  reason: string;
  message?: string;
  created_at: string;
  status: 'pending' | 'resolved';
}

const DATA_DIR = path.join(process.cwd(), 'data');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// ---------------- Contribution Page Data ----------------
const DEFAULT_CONTRIBUTION_CONFIG: ContributionConfig = {
  heading: 'Support OpenMentor',
  subtitle: 'Help us keep GATE preparation 100% free, high-quality, and accessible to every aspiring engineer.',
  upi_id: 'openmentor@upi',
  qr_image_url: '/openmentor-logo.webp',
  supporters: [],
};

const R2_CONTRIBUTION_KEY = 'config/contribution.json';
const R2_POPUP_KEY = 'config/contribution-popup.json';

export async function getContributionConfig(): Promise<ContributionConfig> {
  // Try fetching from Cloudflare R2 first
  try {
    const r2Data = await fetchJsonFromR2<ContributionConfig>(R2_CONTRIBUTION_KEY);
    if (r2Data && typeof r2Data.heading === 'string') {
      return { ...DEFAULT_CONTRIBUTION_CONFIG, ...r2Data };
    }
  } catch (err) {
    console.error('Error fetching contribution.json from R2:', err);
  }

  // Fallback to local data file
  try {
    ensureDataDir();
    const filePath = path.join(DATA_DIR, 'contribution.json');
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return { ...DEFAULT_CONTRIBUTION_CONFIG, ...JSON.parse(data) };
    }
  } catch (error) {
    console.error('Error reading contribution.json locally:', error);
  }
  return DEFAULT_CONTRIBUTION_CONFIG;
}

export async function saveContributionConfig(config: ContributionConfig): Promise<void> {
  // Always save locally
  ensureDataDir();
  const filePath = path.join(DATA_DIR, 'contribution.json');
  fs.writeFileSync(filePath, JSON.stringify(config, null, 2), 'utf-8');

  // Also sync to Cloudflare R2
  try {
    await saveJsonToR2(R2_CONTRIBUTION_KEY, config);
  } catch (err) {
    console.error('Error syncing contribution.json to R2:', err);
  }
}

// ---------------- Contribution Popup Data ----------------
const DEFAULT_POPUP_CONFIG: ContributionPopupConfig = {
  enabled: true,
  image_url: '/openmentor-logo.webp',
  button_text: 'Contribute Now',
  question_threshold: 5,
};

export async function getContributionPopupConfig(): Promise<ContributionPopupConfig> {
  // Try fetching from Cloudflare R2 first
  try {
    const r2Data = await fetchJsonFromR2<ContributionPopupConfig>(R2_POPUP_KEY);
    if (r2Data && typeof r2Data.enabled === 'boolean') {
      return { ...DEFAULT_POPUP_CONFIG, ...r2Data };
    }
  } catch (err) {
    console.error('Error fetching popup config from R2:', err);
  }

  // Fallback to local data file
  try {
    ensureDataDir();
    const filePath = path.join(DATA_DIR, 'contribution-popup.json');
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return { ...DEFAULT_POPUP_CONFIG, ...JSON.parse(data) };
    }
  } catch (error) {
    console.error('Error reading contribution-popup.json locally:', error);
  }
  return DEFAULT_POPUP_CONFIG;
}

export async function saveContributionPopupConfig(config: ContributionPopupConfig): Promise<void> {
  // Always save locally
  ensureDataDir();
  const filePath = path.join(DATA_DIR, 'contribution-popup.json');
  fs.writeFileSync(filePath, JSON.stringify(config, null, 2), 'utf-8');

  // Also sync to Cloudflare R2
  try {
    await saveJsonToR2(R2_POPUP_KEY, config);
  } catch (err) {
    console.error('Error syncing contribution-popup.json to R2:', err);
  }
}

// ---------------- Question Reports Data ----------------
const REPORTS_FILE = path.join(DATA_DIR, 'question-reports.json');

export async function getQuestionReports(): Promise<QuestionReport[]> {
  try {
    ensureDataDir();
    if (fs.existsSync(REPORTS_FILE)) {
      const data = fs.readFileSync(REPORTS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading question-reports.json:', error);
  }
  return [];
}

export async function addQuestionReport(report: Omit<QuestionReport, 'id' | 'created_at' | 'status'>): Promise<QuestionReport> {
  ensureDataDir();
  const reports = await getQuestionReports();
  const newReport: QuestionReport = {
    ...report,
    id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    created_at: new Date().toISOString(),
    status: 'pending',
  };
  reports.unshift(newReport);
  fs.writeFileSync(REPORTS_FILE, JSON.stringify(reports, null, 2), 'utf-8');
  return newReport;
}

export async function updateReportStatus(reportId: string, status: 'pending' | 'resolved'): Promise<boolean> {
  ensureDataDir();
  const reports = await getQuestionReports();
  const target = reports.find((r) => r.id === reportId);
  if (!target) return false;
  target.status = status;
  fs.writeFileSync(REPORTS_FILE, JSON.stringify(reports, null, 2), 'utf-8');
  return true;
}
