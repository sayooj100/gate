import type { Metadata } from 'next';
import { getGATopicQuestions } from '@/lib/gaData';
import { GATopicQuestionsClient } from '@/components/GATopicQuestionsClient';

export const metadata: Metadata = {
  title: 'Topic-wise Practice — General Aptitude (GA) | GATE Preparation',
  description: 'Practice Quantitative Aptitude, Data Interpretation, and Verbal Ability for GATE.',
};

export default async function GATopicWisePage() {
  const subtopicGroups = await getGATopicQuestions();

  return (
    <GATopicQuestionsClient subtopicGroups={subtopicGroups} />
  );
}
