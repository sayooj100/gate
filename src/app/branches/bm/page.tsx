import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Biomedical Engineering (BM) | GATE Preparation',
  description: 'Biomedical Engineering preparation portal.',
};

export default function BMBranchPage() {
  const options = [
    {
      title: 'Topic-wise Practice',
      href: '/branches/bm/topic-wise',
    },
    {
      title: 'Year-wise Practice',
      href: '/branches/bm/year-wise',
    },
    {
      title: 'Full Mock Test',
      href: '/branches/bm/mock-test',
    },
  ];

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-6">
      {/* Back Link */}
      <div className="mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs text-black dark:text-white font-medium hover:underline"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Back to Branches</span>
        </Link>
      </div>

      {/* Header with Square BM Asset with shadow and border */}
      <div className="flex items-center gap-3 pb-4 border-b border-black dark:border-white">
        <div className="relative w-14 h-14 rounded-lg border border-black dark:border-white overflow-hidden bg-white dark:bg-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] shrink-0">
          <Image
            src="/biomedical.webp"
            alt="Biomedical Engineering"
            fill
            sizes="56px"
            className="object-cover"
            priority
          />
        </div>
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-black dark:text-white">
            Biomedical Engineering (BM)
          </h1>
          <p className="text-xs text-black dark:text-white">
            Select a practice mode to get started.
          </p>
        </div>
      </div>

      {/* 3 Clickable Options with stroke boundaries and shadow */}
      <div className="mt-6 flex flex-col gap-3 max-w-md">
        {options.map((option) => (
          <Link
            key={option.href}
            href={option.href}
            className="flex items-center justify-between p-3.5 rounded-lg border border-black dark:border-white bg-white dark:bg-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[1px_1px_0px_0px_rgba(255,255,255,1)] text-black dark:text-white font-bold text-sm transition-all"
          >
            <span>{option.title}</span>
            <span className="text-xs text-black dark:text-white font-bold">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
