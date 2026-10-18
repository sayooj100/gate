'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { GAQuestion } from '@/lib/gaData';
import { QuestionCard } from '@/components/QuestionCard';

interface GAYearQuestionsClientProps {
  year: number;
  questions: GAQuestion[];
}

type QuestionTypeFilter = 'ALL' | 'MCQ' | 'NAT' | 'MSQ';

export function GAYearQuestionsClient({
  year,
  questions,
}: GAYearQuestionsClientProps) {
  const [selectedType, setSelectedType] = useState<QuestionTypeFilter>('ALL');

  // Filter questions based on selected question type
  const filteredQuestions = useMemo(() => {
    return selectedType === 'ALL'
      ? questions
      : questions.filter(
          (q) => q.question_type?.toUpperCase() === selectedType
        );
  }, [questions, selectedType]);

  const qTypeFilters: QuestionTypeFilter[] = ['ALL', 'MCQ', 'NAT', 'MSQ'];

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-5 overflow-hidden">
      {/* Back button above breadcrumbs */}
      <div className="mb-2">
        <Link
          href="/branches/ga/year-wise"
          className="inline-flex items-center gap-1 text-xs font-semibold text-black dark:text-white hover:opacity-75 transition-opacity"
          title="Back to GA Year Selection"
        >
          <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Back to GA Years</span>
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
        <span className="font-bold text-black dark:text-white shrink-0">
          GATE {year} GA
        </span>
      </nav>

      {/* Filter Row: Question Types (ALL, MCQ, NAT, MSQ) */}
      <div className="mb-6 flex items-center gap-1.5">
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

      {/* Heading */}
      <div className="flex items-center justify-between pb-2 mb-5 border-b-2 border-black dark:border-white">
        <h1 className="text-base sm:text-lg font-extrabold text-black dark:text-white">
          GATE {year} — General Aptitude
        </h1>
        <span className="text-xs font-semibold px-2 py-0.5 rounded border border-black dark:border-white bg-white dark:bg-black text-black dark:text-white">
          {filteredQuestions.length} {filteredQuestions.length === 1 ? 'Question' : 'Questions'}
        </span>
      </div>

      {/* Questions list with consecutive numbering starting at Q1 */}
      {filteredQuestions.length === 0 ? (
        <div className="p-6 rounded-lg border border-black dark:border-white bg-white dark:bg-black text-center">
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
            No General Aptitude questions found for {year} matching the selected type ({selectedType}).
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredQuestions.map((question, idx) => (
            <QuestionCard
              key={question.question_id}
              question={question}
              displayNumber={idx + 1}
              sectionName="General Aptitude"
              subtopicName={question.topic_name || 'General Aptitude'}
            />
          ))}
        </div>
      )}
    </div>
  );
}
