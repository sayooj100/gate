import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getGAQuestionsForYear, getAvailableGAYears } from '@/lib/gaData';
import { GAYearQuestionsClient } from '@/components/GAYearQuestionsClient';

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
      title: 'Year Not Found | GA GATE',
    };
  }

  return {
    title: `GATE ${yearNum} General Aptitude (GA) Questions`,
    description: `Practice General Aptitude questions from GATE ${yearNum}.`,
  };
}

export async function generateStaticParams() {
  const years = await getAvailableGAYears();
  return years.map((y) => ({
    year: y.toString(),
  }));
}

export default async function GAYearQuestionsPage({ params }: Props) {
  const { year } = await params;
  const yearNum = parseInt(year, 10);
  if (isNaN(yearNum)) {
    notFound();
  }

  const gaYearData = await getGAQuestionsForYear(yearNum);
  if (!gaYearData) {
    notFound();
  }

  return (
    <GAYearQuestionsClient
      year={gaYearData.year}
      questions={gaYearData.questions}
    />
  );
}
