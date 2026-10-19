import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import type { Metadata } from 'next';
import { getAvailableYears, getMasterCatalogue } from '@/lib/bmData';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{
    branch: string;
  }>;
}

export const revalidate = 60;
export const dynamicParams = true;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { branch } = await params;
  const catalogue = await getMasterCatalogue();
  const category = catalogue.find((c) => c.code.toLowerCase() === branch.toLowerCase());

  const branchName = category ? category.name : branch.toUpperCase();

  return {
    title: `Year-wise Practice | ${branchName} GATE`,
    description: `Year-wise previous question papers practice section for GATE ${branchName}.`,
  };
}

export async function generateStaticParams() {
  const catalogue = await getMasterCatalogue();
  return catalogue
    .filter((c) => c.code.toLowerCase() !== 'ga')
    .map((c) => ({
      branch: c.code.toLowerCase(),
    }));
}

export default async function GenericYearWisePage({ params }: Props) {
  const { branch } = await params;
  const branchUpper = branch.toUpperCase();
  const branchLower = branch.toLowerCase();

  const catalogue = await getMasterCatalogue();
  const category = catalogue.find((c) => c.code.toLowerCase() === branchLower);

  if (!category) {
    notFound();
  }

  const years = await getAvailableYears(branchUpper);

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-6">
      {/* Back Link */}
      <div className="mb-4">
        <Link
          href={`/branches/${branchLower}`}
          className="inline-flex items-center gap-1 text-xs text-black dark:text-white font-medium hover:underline"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Back to {category.name}</span>
        </Link>
      </div>

      {/* Header */}
      <div className="pb-4 border-b border-black dark:border-white">
        <h1 className="text-lg sm:text-xl font-bold text-black dark:text-white">
          Year-wise Practice
        </h1>
        <p className="text-xs text-black dark:text-neutral-300 mt-0.5">
          Select a previous examination year to practice complete papers for {category.name}.
        </p>
      </div>

      {/* Years List */}
      <div className="mt-6 flex flex-col gap-3 max-w-md">
        {years.length === 0 ? (
          <div className="p-6 rounded-lg border border-black dark:border-white bg-white dark:bg-black">
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              No previous year papers found in the metadata for {category.name}.
            </p>
          </div>
        ) : (
          years.map((year) => (
            <Link
              key={year}
              href={`/branches/${branchLower}/year-wise/${year}`}
              className="flex items-center justify-between p-3.5 rounded-lg border border-black dark:border-white bg-white dark:bg-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[1px_1px_0px_0px_rgba(255,255,255,1)] text-black dark:text-white font-bold text-sm transition-all"
            >
              <span>GATE {year}</span>
              <span className="text-xs text-black dark:text-white font-bold">→</span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
