import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import type { Metadata } from 'next';
import { getAvailableSections } from '@/lib/bmData';

export const metadata: Metadata = {
  title: 'Topic-wise Practice | BM GATE',
  description: 'Topic-wise practice section for GATE Biomedical Engineering.',
};

export default async function TopicWisePage() {
  const sections = await getAvailableSections();

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-6">
      {/* Back Link */}
      <div className="mb-4">
        <Link
          href="/branches/bm"
          className="inline-flex items-center gap-1 text-xs text-black dark:text-white font-medium hover:underline"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Back to Biomedical Engineering</span>
        </Link>
      </div>

      {/* Header */}
      <div className="pb-4 border-b border-black dark:border-white">
        <h1 className="text-lg sm:text-xl font-bold text-black dark:text-white">
          Topic-wise Practice
        </h1>
        <p className="text-xs text-black dark:text-neutral-300 mt-0.5">
          Select a section to practice topic-wise questions.
        </p>
      </div>

      {/* Sections List */}
      <div className="mt-6 flex flex-col gap-3 max-w-md">
        {sections.length === 0 ? (
          <div className="p-6 rounded-lg border border-black dark:border-white bg-white dark:bg-black">
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              No sections found in the metadata.
            </p>
          </div>
        ) : (
          sections.map((section) => (
            <Link
              key={section.section_id}
              href={`/branches/bm/topic-wise/${section.section_id.toLowerCase()}`}
              className="flex items-center justify-between p-3.5 rounded-lg border border-black dark:border-white bg-white dark:bg-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[1px_1px_0px_0px_rgba(255,255,255,1)] text-black dark:text-white font-bold text-sm transition-all"
            >
              <span>{section.section_name}</span>
              <span className="text-xs text-black dark:text-white font-bold">→</span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
