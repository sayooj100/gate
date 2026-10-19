import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getMasterCatalogue } from '@/lib/bmData';

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

  if (!category) {
    return {
      title: 'Branch Not Found | GATE Preparation',
    };
  }

  return {
    title: `${category.name} (${category.code}) | GATE Preparation`,
    description: category.description || `${category.name} preparation portal.`,
  };
}

export async function generateStaticParams() {
  const catalogue = await getMasterCatalogue();
  return catalogue
    .filter((c) => c.code.toLowerCase() !== 'ga') // GA has its own custom view
    .map((c) => ({
      branch: c.code.toLowerCase(),
    }));
}

export default async function GenericBranchPage({ params }: Props) {
  const { branch } = await params;
  const branchLower = branch.toLowerCase();

  const catalogue = await getMasterCatalogue();
  const category = catalogue.find((c) => c.code.toLowerCase() === branchLower);

  if (!category) {
    notFound();
  }

  const options = [
    {
      title: 'Topic-wise Practice',
      href: `/branches/${branchLower}/topic-wise`,
    },
    {
      title: 'Year-wise Practice',
      href: `/branches/${branchLower}/year-wise`,
    },
    {
      title: 'Full Mock Test',
      href: `/branches/${branchLower}/mock-test`,
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

      {/* Header with Square Asset with shadow and border */}
      <div className="flex items-center gap-3 pb-4 border-b border-black dark:border-white">
        <div className="relative w-14 h-14 rounded-lg border border-black dark:border-white overflow-hidden bg-white dark:bg-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] shrink-0">
          <Image
            src={category.image || '/biomedical.webp'}
            alt={category.name}
            fill
            sizes="56px"
            className="object-cover"
            priority
          />
        </div>
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-black dark:text-white">
            {category.name} ({category.code})
          </h1>
          <p className="text-xs text-black dark:text-white">
            Select a practice mode to get started.
          </p>
        </div>
      </div>

      {/* Main Options with Black Borders & Shadows */}
      <div className="mt-6 flex flex-col gap-3 max-w-md">
        {options.map((opt) => (
          <Link
            key={opt.title}
            href={opt.href}
            className="flex items-center justify-between p-4 rounded-xl border border-black dark:border-white bg-white dark:bg-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] text-black dark:text-white font-bold text-sm transition-all"
          >
            <span>{opt.title}</span>
            <span className="text-xs font-bold">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
