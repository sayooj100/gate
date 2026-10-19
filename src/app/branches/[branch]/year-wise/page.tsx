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

      {/* 2 columns per row rounded cards */}
      <div className="mt-6">
        {years.length === 0 ? (
          <div className="p-6 rounded-lg border border-black dark:border-white bg-white dark:bg-black max-w-sm">
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              No previous year papers found in the metadata for {category.name}.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-sm">
            {years.map((year) => (
              <Link
                key={year}
                href={`/branches/${branchLower}/year-wise/${year}`}
                className="group flex flex-col items-center justify-center py-5 px-3 rounded-2xl border border-black dark:border-white bg-white dark:bg-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-all cursor-pointer"
              >
                <span className="text-lg sm:text-xl font-extrabold text-black dark:text-white tracking-tight">
                  {year}
                </span>
                <span className="text-[10px] text-neutral-600 dark:text-neutral-400 font-semibold uppercase mt-0.5">
                  GATE {branchUpper}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
