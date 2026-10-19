import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getQuestionsForSection, getAvailableSections } from '@/lib/bmData';
import { SectionQuestionsClient } from '@/components/SectionQuestionsClient';

interface Props {
  params: Promise<{
    section: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { section } = await params;
  const sectionData = await getQuestionsForSection(section);

  if (!sectionData) {
    return {
      title: 'Section Not Found | BM GATE',
    };
  }

  return {
    title: `${sectionData.section_name} - Questions | BM GATE`,
    description: `Practice all ${sectionData.section_name} questions for GATE Biomedical Engineering organized by subtopic.`,
  };
}

export const revalidate = 60; // Auto-revalidate from Cloudflare R2 every 60s
export const dynamicParams = true; // Automatically render newly added sections dynamically from R2

export async function generateStaticParams() {
  const sections = await getAvailableSections();
  return sections.map((sec) => ({
    section: sec.section_id.toLowerCase(),
  }));
}

export default async function SectionQuestionsPage({ params }: Props) {
  const { section } = await params;
  const sectionData = await getQuestionsForSection(section);

  if (!sectionData) {
    notFound();
  }

  return (
    <SectionQuestionsClient
      sectionId={sectionData.section_id}
      sectionName={sectionData.section_name}
      subtopicGroups={sectionData.subtopicGroups}
    />
  );
}
