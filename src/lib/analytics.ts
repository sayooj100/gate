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
    const jsonStr = JSON.stringify(payload);
    // Prefer sendBeacon with explicit Blob type
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const sent = navigator.sendBeacon('/api/analytics', blob);
      if (!sent) {
        // Fallback to fetch if sendBeacon returned false
        fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: jsonStr,
          keepalive: true,
        }).catch(() => {});
      }
    } else {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: jsonStr,
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
