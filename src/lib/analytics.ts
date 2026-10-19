'use client';

type EventType =
  | 'session_start'
  | 'question_attempt'
  | 'question_solved'
  | 'contribution_click'
  | 'email_submission';

interface EventPayload {
  type: EventType;
  visitor_id?: string;
  session_id?: string;
  metadata?: Record<string, unknown>;
}

// Helpers for privacy-conscious visitor identifier and session identifier
function getOrCreateVisitorId(): string {
  if (typeof window === 'undefined') return '';
  let vid = localStorage.getItem('om_visitor_id');
  if (!vid) {
    vid = 'v_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
    try {
      localStorage.setItem('om_visitor_id', vid);
    } catch {
      // Ignore private browsing storage quota error
    }
  }
  return vid;
}

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';
  let sid = sessionStorage.getItem('om_session_id');
  if (!sid) {
    sid = 's_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
    try {
      sessionStorage.setItem('om_session_id', sid);
    } catch {
      // Ignore
    }
  }
  return sid;
}

export function trackEvent(type: EventType, metadata?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;

  const visitor_id = getOrCreateVisitorId();
  const session_id = getOrCreateSessionId();

  const payload: EventPayload = {
    type,
    visitor_id,
    session_id,
    metadata,
  };

  try {
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics', JSON.stringify(payload));
    } else {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // Analytics failures must never break user experience
  }
}

let hasInitializedSession = false;

export function initSessionTracking(): void {
  if (typeof window === 'undefined' || hasInitializedSession) return;
  hasInitializedSession = true;

  const sessionRecorded = sessionStorage.getItem('om_session_recorded');
  if (!sessionRecorded) {
    trackEvent('session_start');
    try {
      sessionStorage.setItem('om_session_recorded', 'true');
    } catch {
      // Ignore
    }
  }
}
