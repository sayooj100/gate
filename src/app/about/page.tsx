import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Heart } from 'lucide-react';

function InstagramIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export const metadata: Metadata = {
  title: 'About OpenMentor | Free Peer-Taught Learning',
  description:
    'Free topic-wise learning for college students, taught by seniors who just passed the exam.',
};

export default function AboutPage() {
  return (
    <div className="flex flex-col flex-1 w-full max-w-3xl mx-auto px-4 py-8 sm:py-12">
      {/* Main Title & Subtitle */}
      <section className="mb-10 text-left border-b border-black dark:border-white pb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-black dark:text-white uppercase">
          OpenMentor
        </h1>
        <p className="mt-3 text-base sm:text-lg font-bold text-black dark:text-white leading-snug">
          Free topic-wise learning for college students, taught by seniors who just passed the exam.
        </p>
      </section>

      {/* Vision & Mission */}
      <section className="space-y-8 mb-10">
        <div className="p-5 rounded-xl border border-black dark:border-white bg-white dark:bg-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]">
          <h2 className="text-base sm:text-lg font-extrabold uppercase text-black dark:text-white mb-2">
            Our Vision
          </h2>
          <p className="text-sm sm:text-base text-neutral-800 dark:text-neutral-200 leading-relaxed font-normal">
            Every college student learns any topic, free, from someone who has just been through it.
          </p>
        </div>

        <div className="p-5 rounded-xl border border-black dark:border-white bg-white dark:bg-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]">
          <h2 className="text-base sm:text-lg font-extrabold uppercase text-black dark:text-white mb-2">
            Our Mission
          </h2>
          <p className="text-sm sm:text-base text-neutral-800 dark:text-neutral-200 leading-relaxed font-normal">
            Break every subject into small topics and let seniors explain them in 5 to 10 minute videos, so no student has to struggle with bulky textbooks and scattered notes.
          </p>
        </div>
      </section>

      {/* What We're Building */}
      <section className="p-6 rounded-xl border border-black dark:border-white bg-white dark:bg-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] mb-10 space-y-4">
        <h2 className="text-lg font-extrabold uppercase text-black dark:text-white">
          What We’re Building
        </h2>
        <ul className="space-y-2 text-sm sm:text-base text-neutral-800 dark:text-neutral-200 list-disc list-inside">
          <li>Short videos by seniors who wrote the exam last semester</li>
          <li>Simple notes for every topic</li>
          <li>Everything free, for everyone</li>
        </ul>

        <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-3 text-sm sm:text-base text-neutral-800 dark:text-neutral-200">
          <p>
            OpenMentor is free for students, so it runs on support from people who believe in it. Your contribution helps us:
          </p>
          <ul className="space-y-1.5 list-disc list-inside ml-2">
            <li>Build and run the platform</li>
            <li>Create and publish the first topics</li>
            <li>Bring in more seniors as teachers</li>
            <li>Reach more colleges</li>
          </ul>
        </div>
      </section>

      {/* Join Us Early */}
      <section className="p-6 rounded-xl border border-black dark:border-white bg-white dark:bg-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] mb-10">
        <h2 className="text-lg font-extrabold uppercase text-black dark:text-white mb-2">
          Join Us Early
        </h2>
        <p className="text-sm sm:text-base text-neutral-800 dark:text-neutral-200 leading-relaxed">
          You’re not just donating. You’re helping build the learning platform students have been missing. Every contribution, big or small, gets us closer to launch.
        </p>
      </section>

      {/* Links & CTA */}
      <section className="flex flex-col sm:flex-row items-center gap-4 pt-4">
        <Link
          href="/contribution"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black font-extrabold text-sm border border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer"
        >
          <Heart className="w-4 h-4 fill-current" />
          <span>Contribute to OpenMentor</span>
          <ArrowRight className="w-4 h-4" />
        </Link>

        <a
          href="https://instagram.com/openmentorloarn"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-black text-black dark:text-white font-extrabold text-sm border border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
        >
          <InstagramIcon className="w-4 h-4" />
          <span>Follow on Instagram (@openmentorloarn)</span>
        </a>
      </section>
    </div>
  );
}
