import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getQuestionsForYear, getAvailableYears } from '@/lib/bmData';
import { YearQuestionsClient } from '@/components/YearQuestionsClient';

interface Props {
  params: Promise<{
    year: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { year } = await params;
  const yearNum = parseInt(year, 10);
  if (isNaN(yearNum)) {
    return {
      title: 'Year Not Found | BM GATE',
    };
  }

  return {
    title: `GATE ${yearNum} Biomedical Engineering (BM) Questions`,
    description: `Practice complete previous year question paper for GATE BM ${yearNum} organized by sections.`,
  };
}

export const revalidate = 60; // Auto-revalidate from Cloudflare R2 every 60s
export const dynamicParams = true; // Automatically render newly added years dynamically from R2

export async function generateStaticParams() {
  const years = await getAvailableYears();
  return years.map((y) => ({
    year: y.toString(),
  }));
}

export default async function YearQuestionsPage({ params }: Props) {
  const { year } = await params;
  const yearNum = parseInt(year, 10);
  if (isNaN(yearNum)) {
    notFound();
  }

  const yearData = await getQuestionsForYear(yearNum);
  if (!yearData) {
    notFound();
  }

  return (
    <YearQuestionsClient
      year={yearData.year}
      sections={yearData.sections}
    />
  );
}
