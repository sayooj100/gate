import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getQuestionsForYear, getAvailableYears, getMasterCatalogue } from '@/lib/bmData';
import { YearQuestionsClient } from '@/components/YearQuestionsClient';

interface Props {
  params: Promise<{
    branch: string;
    year: string;
  }>;
}

export const revalidate = 60;
export const dynamicParams = true;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { branch, year } = await params;
  const branchUpper = branch.toUpperCase();
  const yearNum = parseInt(year, 10);
  if (isNaN(yearNum)) {
    return {
      title: `Year Not Found | ${branchUpper} GATE`,
    };
  }

  return {
    title: `GATE ${yearNum} ${branchUpper} Questions`,
    description: `Practice complete previous year question paper for GATE ${branchUpper} ${yearNum} organized by sections.`,
  };
}

export async function generateStaticParams() {
  const catalogue = await getMasterCatalogue();
  const paths: Array<{ branch: string; year: string }> = [];

  for (const cat of catalogue) {
    if (cat.code.toLowerCase() === 'ga') continue;
    const years = await getAvailableYears(cat.code.toUpperCase());
    for (const y of years) {
      paths.push({
        branch: cat.code.toLowerCase(),
        year: y.toString(),
      });
    }
  }

  return paths;
}

export default async function GenericYearQuestionsPage({ params }: Props) {
  const { branch, year } = await params;
  const branchUpper = branch.toUpperCase();
  const yearNum = parseInt(year, 10);

  if (isNaN(yearNum)) {
    notFound();
  }

  const yearData = await getQuestionsForYear(yearNum, branchUpper);
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
