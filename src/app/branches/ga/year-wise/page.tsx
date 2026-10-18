import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import type { Metadata } from 'next';
import { getAvailableGAYears } from '@/lib/gaData';

export const metadata: Metadata = {
  title: 'Year-wise Practice — General Aptitude (GA) | GATE Preparation',
  description: 'Practice General Aptitude questions year-by-year from previous GATE examination papers.',
};

export default async function GAYearWisePage() {
  const years = await getAvailableGAYears();

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-6">
      {/* Back Link */}
      <div className="mb-4">
        <Link
          href="/branches/ga"
          className="inline-flex items-center gap-1 text-xs text-black dark:text-white font-medium hover:underline"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Back to General Aptitude</span>
        </Link>
      </div>

      {/* Header */}
      <div className="pb-4 border-b border-black dark:border-white">
        <h1 className="text-lg sm:text-xl font-bold text-black dark:text-white">
          Year-wise Practice — General Aptitude
        </h1>
        <p className="text-xs text-black dark:text-neutral-300 mt-0.5">
          Select an examination year to practice previous GATE General Aptitude questions.
        </p>
      </div>

      {/* 2 columns per row year cards linking to /branches/ga/year-wise/[year] */}
      <div className="mt-6">
        {years.length === 0 ? (
          <div className="p-6 rounded-lg border border-black dark:border-white bg-white dark:bg-black max-w-lg">
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              No examination years found for General Aptitude.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-sm">
            {years.map((year) => (
              <Link
                key={year}
                href={`/branches/ga/year-wise/${year}`}
                className="group flex flex-col items-center justify-center py-5 px-3 rounded-xl border border-black dark:border-white bg-white dark:bg-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-all cursor-pointer"
              >
                <span className="text-lg sm:text-xl font-extrabold text-black dark:text-white tracking-tight">
                  {year}
                </span>
                <span className="text-[10px] text-neutral-600 dark:text-neutral-400 font-semibold uppercase mt-0.5">
                  GATE GA
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
