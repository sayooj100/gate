'use client';

import Link from 'next/link';
import { trackEvent } from '@/lib/analytics';

export function Footer() {
  const handleContributeClick = () => {
    trackEvent('contribution_click', { source: 'footer_link' });
  };

  return (
    <footer className="w-full border-t border-black dark:border-white bg-white dark:bg-black py-6 transition-colors">
      <div className="max-w-4xl mx-auto px-4 flex flex-col items-center justify-center text-center gap-3 text-xs text-black dark:text-white">
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 font-medium">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <Link href="/about" className="hover:underline">
            About
          </Link>
          <Link
            href="/contribution"
            onClick={handleContributeClick}
            className="hover:underline font-semibold"
          >
            Contribute
          </Link>
          <a
            href="https://instagram.com/openmentorloarn"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
          >
            Instagram (@openmentorloarn)
          </a>
        </div>
        <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
          <span>&copy; 2026 OpenMentor GATE Portal.</span>
        </div>
      </div>
    </footer>
  );
}
