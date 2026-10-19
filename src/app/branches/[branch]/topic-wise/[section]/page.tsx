import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getQuestionsForSection, getAvailableSections, getMasterCatalogue } from '@/lib/bmData';
import { SectionQuestionsClient } from '@/components/SectionQuestionsClient';

interface Props {
  params: Promise<{
    branch: string;
    section: string;
  }>;
}

export const revalidate = 60;
export const dynamicParams = true;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { branch, section } = await params;
  const branchUpper = branch.toUpperCase();
  const sectionData = await getQuestionsForSection(section, branchUpper);

  if (!sectionData) {
    return {
      title: `Section Not Found | ${branchUpper} GATE`,
    };
  }

  return {
    title: `${sectionData.section_name} - Questions | ${branchUpper} GATE`,
    description: `Practice all ${sectionData.section_name} questions for GATE ${branchUpper} organized by subtopic.`,
  };
}

export async function generateStaticParams() {
  const catalogue = await getMasterCatalogue();
  const paths: Array<{ branch: string; section: string }> = [];

  for (const cat of catalogue) {
    if (cat.code.toLowerCase() === 'ga') continue;
    const sections = await getAvailableSections(cat.code.toUpperCase());
    for (const sec of sections) {
      paths.push({
        branch: cat.code.toLowerCase(),
        section: sec.section_id.toLowerCase(),
      });
    }
  }

  return paths;
}

export default async function GenericSectionQuestionsPage({ params }: Props) {
  const { branch, section } = await params;
  const branchUpper = branch.toUpperCase();
  const sectionData = await getQuestionsForSection(section, branchUpper);

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
