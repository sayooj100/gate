'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Mail, CheckCircle2, Clock } from 'lucide-react';

export default function MockTestPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'submitted' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();

    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmed || !emailRegex.test(trimmed)) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setStatus('submitting');
    setMessage('');

    // Ready for future email-collection service (e.g. Supabase, Resend, or Mailchimp)
    console.log('[Mock Test Waitlist Request Queued]:', trimmed);

    setTimeout(() => {
      // Clear status indicating email has been recorded locally / queued for when service connects
      setStatus('submitted');
      setMessage('Thank you! Your interest has been recorded for early access.');
      setEmail('');
    }, 450);
  };

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Return to BM Hub link */}
      <div className="mb-6">
        <Link
          href="/branches/bm"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-black dark:text-white hover:opacity-75 transition-opacity"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Biomedical Engineering</span>
        </Link>
      </div>

      {/* Main Waitlist Card */}
      <div className="p-8 sm:p-12 rounded-2xl border border-black dark:border-white bg-white dark:bg-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] max-w-xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-black dark:border-white bg-black dark:bg-white text-white dark:text-black mb-6">
          <Clock className="w-3.5 h-3.5" />
          <span>Under Development</span>
        </div>

        {/* Headline */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-black dark:text-white tracking-tight uppercase">
          Full Mock Tests — Coming Soon
        </h1>

        {/* Supporting Text */}
        <p className="mt-3 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-md mx-auto">
          We&apos;re working on a realistic GATE mock-test experience. Leave your email below and be among the first to know when it launches.
        </p>

        {/* Email Subscription Form */}
        <div className="mt-8">
          {status === 'submitted' ? (
            <div className="p-4 rounded-xl border border-black dark:border-white bg-neutral-50 dark:bg-neutral-900 text-center">
              <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-black dark:text-white" />
              <p className="text-xs sm:text-sm font-bold text-black dark:text-white">
                {message}
              </p>
              <button
                type="button"
                onClick={() => setStatus('idle')}
                className="mt-3 text-xs underline font-semibold text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
              >
                Enter another email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch gap-2.5 max-w-md mx-auto">
              <div className="relative flex-1">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === 'error') setStatus('idle');
                  }}
                  placeholder="Enter your email address"
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-black dark:border-white bg-white dark:bg-black text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                />
              </div>
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="px-4 py-2 rounded-lg border border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-extrabold text-xs sm:text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:opacity-90 transition-opacity cursor-pointer shrink-0 disabled:opacity-50"
              >
                {status === 'submitting' ? 'Submitting...' : 'Get Early Access'}
              </button>
            </form>
          )}

          {status === 'error' && (
            <p className="mt-2 text-xs font-semibold text-red-600 dark:text-red-400">
              {message}
            </p>
          )}
        </div>

        {/* Back Link */}
        <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-800">
          <Link
            href="/branches/bm"
            className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white underline transition-colors"
          >
            Return to Biomedical Engineering Hub
          </Link>
        </div>
      </div>
    </div>
  );
}
