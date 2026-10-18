'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { YearSectionGroup } from '@/lib/bmData';
import { QuestionCard } from '@/components/QuestionCard';

interface YearQuestionsClientProps {
  year: number;
  sections: YearSectionGroup[];
}

type QuestionTypeFilter = 'ALL' | 'MCQ' | 'NAT' | 'MSQ';

export function YearQuestionsClient({
  year,
  sections,
}: YearQuestionsClientProps) {
  const [selectedType, setSelectedType] = useState<QuestionTypeFilter>('ALL');

  // Filter questions based on selected question type
  const filteredSections = useMemo(() => {
    return sections.map((sec) => {
      const filteredQuestions =
        selectedType === 'ALL'
          ? sec.questions
          : sec.questions.filter(
              (q) => q.question_type?.toUpperCase() === selectedType
            );

      return {
        ...sec,
        questions: filteredQuestions,
      };
    });
  }, [sections, selectedType]);

  const activeSections = filteredSections.filter((s) => s.questions.length > 0);

  // Consecutive question numbering across all displayed questions for this year
  const questionNumberMap = useMemo(() => {
    const map = new Map<string, number>();
    let count = 0;
    for (const sec of activeSections) {
      for (const q of sec.questions) {
        count++;
        map.set(q.question_id, count);
      }
    }
    return map;
  }, [activeSections]);

  const [selectedSectionId, setSelectedSectionId] = useState<string>('');

  const activeSectionId =
    selectedSectionId && activeSections.some((s) => s.section_id === selectedSectionId)
      ? selectedSectionId
      : activeSections[0]?.section_id || '';

  // Scroll to section smoothly
  const handleScrollToSection = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      const yOffset = -70;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // Track currently viewed section during scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 140;

      for (let i = activeSections.length - 1; i >= 0; i--) {
        const sec = activeSections[i];
        const el = document.getElementById(`section-${sec.section_id}`);
        if (el && el.offsetTop <= scrollPosition) {
          setSelectedSectionId(sec.section_id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeSections]);

  const currentActiveSection = activeSections.find((s) => s.section_id === activeSectionId) || activeSections[0];
  const currentSectionName = currentActiveSection?.section_name || '';

  const qTypeFilters: QuestionTypeFilter[] = ['ALL', 'MCQ', 'NAT', 'MSQ'];

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-5 overflow-hidden">
      {/* Back button above breadcrumbs */}
      <div className="mb-2">
        <Link
          href="/branches/bm/year-wise"
          className="inline-flex items-center gap-1 text-xs font-semibold text-black dark:text-white hover:opacity-75 transition-opacity"
          title="Back to Year Selection"
        >
          <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Back to Years</span>
        </Link>
      </div>

      {/* Top Breadcrumb Bar */}
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-xs text-black dark:text-white pb-2.5 border-b border-black dark:border-white overflow-x-auto no-scrollbar whitespace-nowrap">
        <Link
          href="/branches/bm"
          className="font-medium hover:underline text-black dark:text-white shrink-0"
        >
          BM
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
        <Link
          href="/branches/bm/year-wise"
          className="font-medium hover:underline text-black dark:text-white shrink-0"
        >
          Years
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
        <span className="font-bold text-black dark:text-white shrink-0">
          GATE {year}
        </span>
        {currentSectionName && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <span className="font-bold text-black dark:text-white truncate max-w-[200px] shrink-0">
              {currentSectionName}
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

      {/* Compact Section Navigation Buttons: horizontally scrollable on small screens */}
      <div className="mb-6 flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-1">
        {activeSections.map((sec) => {
          const isSelected = sec.section_id === activeSectionId;
          return (
            <button
              key={sec.section_id}
              onClick={() => handleScrollToSection(sec.section_id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border border-black dark:border-white cursor-pointer inline-flex items-center gap-1.5 shrink-0 ${
                isSelected
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'
                  : 'bg-white text-black dark:bg-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900'
              }`}
            >
              <span>{sec.section_name}</span>
              <span className="text-[10px] opacity-75 font-normal">
                ({sec.questions.length})
              </span>
            </button>
          );
        })}
      </div>

      {/* Continuously Scrollable Question List */}
      <div className="space-y-10">
        {activeSections.length === 0 ? (
          <div className="p-6 rounded-lg border border-black dark:border-white bg-white dark:bg-black text-center">
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
              No questions found matching the selected type ({selectedType}).
            </p>
          </div>
        ) : (
          activeSections.map((sec) => (
            <section
              key={sec.section_id}
              id={`section-${sec.section_id}`}
              className="scroll-mt-20"
            >
              {/* Section Heading */}
              <div className="flex items-center justify-between pb-2 mb-4 border-b-2 border-black dark:border-white">
                <h2 className="text-base sm:text-lg font-extrabold text-black dark:text-white">
                  {sec.section_name}
                </h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded border border-black dark:border-white bg-white dark:bg-black text-black dark:text-white">
                  {sec.questions.length} {sec.questions.length === 1 ? 'Question' : 'Questions'}
                </span>
              </div>

              {/* Questions in section with consecutive numbering starting at Q1 */}
              <div className="space-y-5">
                {sec.questions.map((question) => (
                  <QuestionCard
                    key={question.question_id}
                    question={question}
                    displayNumber={questionNumberMap.get(question.question_id) || 1}
                    sectionName={sec.section_name}
                    subtopicName={question.topic_name || sec.section_name}
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
