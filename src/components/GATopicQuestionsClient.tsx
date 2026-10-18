'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { GASubtopicGroup } from '@/lib/gaData';
import { QuestionCard } from '@/components/QuestionCard';

interface GATopicQuestionsClientProps {
  subtopicGroups: GASubtopicGroup[];
}

type QuestionTypeFilter = 'ALL' | 'MCQ' | 'NAT' | 'MSQ';

export function GATopicQuestionsClient({
  subtopicGroups,
}: GATopicQuestionsClientProps) {
  const [selectedType, setSelectedType] = useState<QuestionTypeFilter>('ALL');

  // Filter questions based on selected question type
  const filteredGroups = useMemo(() => {
    return subtopicGroups.map((group) => {
      const filteredQuestions =
        selectedType === 'ALL'
          ? group.questions
          : group.questions.filter(
              (q) => q.question_type?.toUpperCase() === selectedType
            );

      return {
        ...group,
        questions: filteredQuestions,
      };
    });
  }, [subtopicGroups, selectedType]);

  const activeGroups = filteredGroups.filter((g) => g.questions.length > 0);

  // Consecutive question numbering across all displayed questions
  const questionNumberMap = useMemo(() => {
    const map = new Map<string, number>();
    let count = 0;
    for (const group of activeGroups) {
      for (const q of group.questions) {
        count++;
        map.set(q.question_id, count);
      }
    }
    return map;
  }, [activeGroups]);

  const [selectedSubtopicId, setSelectedSubtopicId] = useState<string>('');

  const activeSubtopicId =
    selectedSubtopicId && activeGroups.some((g) => g.topic_id === selectedSubtopicId)
      ? selectedSubtopicId
      : activeGroups[0]?.topic_id || '';

  const handleScrollToSubtopic = (topicId: string) => {
    setSelectedSubtopicId(topicId);
    const element = document.getElementById(`subtopic-${topicId}`);
    if (element) {
      const yOffset = -70;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 140;

      for (let i = activeGroups.length - 1; i >= 0; i--) {
        const group = activeGroups[i];
        const el = document.getElementById(`subtopic-${group.topic_id}`);
        if (el && el.offsetTop <= scrollPosition) {
          setSelectedSubtopicId(group.topic_id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeGroups]);

  const currentActiveGroup = activeGroups.find((g) => g.topic_id === activeSubtopicId) || activeGroups[0];
  const currentSubtopicName = currentActiveGroup?.topic_name || '';

  const qTypeFilters: QuestionTypeFilter[] = ['ALL', 'MCQ', 'NAT', 'MSQ'];

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-5 overflow-hidden">
      {/* Back button above breadcrumbs */}
      <div className="mb-2">
        <Link
          href="/branches/ga"
          className="inline-flex items-center gap-1 text-xs font-semibold text-black dark:text-white hover:opacity-75 transition-opacity"
          title="Back to General Aptitude"
        >
          <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Back to General Aptitude</span>
        </Link>
      </div>

      {/* Top Breadcrumb Bar */}
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-xs text-black dark:text-white pb-2.5 border-b border-black dark:border-white overflow-x-auto no-scrollbar whitespace-nowrap">
        <Link
          href="/branches/ga"
          className="font-medium hover:underline text-black dark:text-white shrink-0"
        >
          GA
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
        <Link
          href="/branches/ga/year-wise"
          className="font-medium hover:underline text-black dark:text-white shrink-0"
        >
          Years
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
        <span className="font-medium text-black dark:text-white shrink-0">
          Topic-wise Practice
        </span>
        {currentSubtopicName && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <span className="font-bold text-black dark:text-white truncate max-w-[200px] shrink-0">
              {currentSubtopicName}
            </span>
          </>
        )}
      </nav>

      {/* Filter Row: Question Types (ALL, MCQ, NAT, MSQ) */}
      <div className="mb-3 flex items-center gap-1.5">
        <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mr-1">
          Type:
        </span>
        {qTypeFilters.map((type) => {
          const isSelected = selectedType === type;
          return (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-2.5 py-0.5 rounded text-xs font-bold transition-all border border-black dark:border-white cursor-pointer ${
                isSelected
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'
                  : 'bg-white text-black dark:bg-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900'
              }`}
            >
              {type}
            </button>
          );
        })}
      </div>

      {/* 3 Specified Subtopics Navigation Pills */}
      <div className="mb-6 flex flex-wrap items-center gap-1.5 sm:gap-2">
        {activeGroups.map((group) => {
          const isSelected = group.topic_id === activeSubtopicId;
          return (
            <button
              key={group.topic_id}
              onClick={() => handleScrollToSubtopic(group.topic_id)}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all border border-black dark:border-white cursor-pointer inline-flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'
                  : 'bg-white text-black dark:bg-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900'
              }`}
            >
              <span>{group.topic_name}</span>
              <span className="text-[10px] opacity-75 font-normal">
                ({group.questions.length})
              </span>
            </button>
          );
        })}
      </div>

      {/* Continuously Scrollable Question List */}
      <div className="space-y-10">
        {activeGroups.length === 0 ? (
          <div className="p-6 rounded-lg border border-black dark:border-white bg-white dark:bg-black text-center">
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
              No General Aptitude questions found matching the selected type ({selectedType}).
            </p>
          </div>
        ) : (
          activeGroups.map((group) => (
            <section
              key={group.topic_id}
              id={`subtopic-${group.topic_id}`}
              className="scroll-mt-20"
            >
              {/* Subtopic Heading */}
              <div className="flex items-center justify-between pb-2 mb-4 border-b-2 border-black dark:border-white">
                <h2 className="text-base sm:text-lg font-extrabold text-black dark:text-white">
                  {group.topic_name}
                </h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded border border-black dark:border-white bg-white dark:bg-black text-black dark:text-white">
                  {group.questions.length} {group.questions.length === 1 ? 'Question' : 'Questions'}
                </span>
              </div>

              {/* Questions in subtopic consecutively numbered starting at Q1 */}
              <div className="space-y-5">
                {group.questions.map((question) => (
                  <QuestionCard
                    key={question.question_id}
                    question={question}
                    displayNumber={questionNumberMap.get(question.question_id) || 1}
                    sectionName="General Aptitude"
                    subtopicName={group.topic_name}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
