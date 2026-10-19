'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Mail, CheckCircle2, Clock } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function GenericMockTestPage() {
  const params = useParams();
  const branchParam = (params?.branch as string) || 'branch';
  const branchUpper = branchParam.toUpperCase();

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

    console.log(`[Mock Test Waitlist Request Queued for ${branchUpper}]:`, trimmed);

    setTimeout(() => {
      setStatus('submitted');
      setMessage('Thank you! Your interest has been recorded for early access.');
      setEmail('');
    }, 450);
  };

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Return to Branch Hub link */}
      <div className="mb-6">
        <Link
          href={`/branches/${branchParam.toLowerCase()}`}
          className="inline-flex items-center gap-1.5 text-xs text-black dark:text-white font-semibold hover:underline transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to {branchUpper}</span>
        </Link>
      </div>

      <div className="max-w-xl mx-auto">
        {/* Main Card */}
        <div className="p-6 sm:p-8 rounded-xl border border-black dark:border-white bg-white dark:bg-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-black dark:bg-white text-white dark:text-black text-xs font-extrabold uppercase mb-4">
            <Clock className="w-3.5 h-3.5" />
            <span>Coming Soon</span>
          </div>

          {/* Heading */}
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-black dark:text-white uppercase">
            Full {branchUpper} Mock Tests
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-normal">
            Simulate the exact GATE examination experience with realistic timer constraints, section-switching, virtual calculator integration, and comprehensive post-test performance analysis.
          </p>

          {/* Notification / Early Access Form */}
          <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-800">
            <h2 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white mb-2">
              Get notified when Mock Tests launch
            </h2>

            {status === 'submitted' ? (
              <div className="p-4 rounded-lg border border-black dark:border-white bg-white dark:bg-black flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-black dark:text-white shrink-0 mt-0.5" />
                <p className="text-xs font-bold text-black dark:text-white">{message}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 mt-3">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-black dark:border-white bg-white dark:bg-black text-xs text-black dark:text-white placeholder:text-neutral-400 focus:outline-none"
                    disabled={status === 'submitting'}
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="px-5 py-2.5 rounded-lg bg-black dark:bg-white text-white dark:text-black font-extrabold text-xs uppercase border border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer disabled:opacity-50"
                >
                  {status === 'submitting' ? 'Submitting...' : 'Notify Me'}
                </button>
              </form>
            )}

            {status === 'error' && (
              <p className="mt-2 text-xs font-bold text-red-600 dark:text-red-400">{message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
