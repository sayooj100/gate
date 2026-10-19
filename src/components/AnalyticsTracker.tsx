'use client';

import { useEffect } from 'react';
import { initSessionTracking } from '@/lib/analytics';

export function AnalyticsTracker() {
  useEffect(() => {
    initSessionTracking();
  }, []);

  return null;
}
