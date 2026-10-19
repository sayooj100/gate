'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Flag } from 'lucide-react';
import { BMQuestion } from '@/lib/bmData';
import { MathRenderer } from './MathRenderer';
import { ReportIssueModal } from './ReportIssueModal';
import { QuestionImage } from './QuestionImage';
import { trackEvent } from '@/lib/analytics';
import { useQuestionPractice } from './ContributionPopup';

interface QuestionCardProps {
  question: BMQuestion;
  displayNumber: number; // Consecutive Q1, Q2, Q3... for currently displayed filtered view
  sectionName: string;
  subtopicName: string;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  displayNumber,
  sectionName,
  subtopicName,
}) => {
  const practiceCtx = useQuestionPractice();
  // Option selection state
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  // Whether user checked / submitted answer
  const [isChecked, setIsChecked] = useState<boolean>(false);
  // Whether explanation area is expanded
  const [isExplanationOpen, setIsExplanationOpen] = useState<boolean>(false);
  // Report issue modal state
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  // NAT value input
  const [natAnswer, setNatAnswer] = useState<string>('');

  const textToRender = question.display_text || question.original_text || '';
  const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
  const qType = question.question_type?.toUpperCase() || 'MCQ';
  const isNAT = qType === 'NAT';
  const isMSQ = qType === 'MSQ';
  const hasOptions = !isNAT && Array.isArray(question.options) && question.options.length > 0;

  // Resolve correct answer letters from question.answer
  const correctLettersSet = new Set<string>();
  const rawAnswerVal = question.answer?.value;

  if (Array.isArray(rawAnswerVal)) {
    rawAnswerVal.forEach((item) => {
      if (typeof item === 'string') {
        item.split(',').forEach((l) => correctLettersSet.add(l.trim().toUpperCase()));
      }
    });
  } else if (typeof rawAnswerVal === 'string') {
    rawAnswerVal.split(',').forEach((l) => correctLettersSet.add(l.trim().toUpperCase()));
  } else if (question.answer?.original_representation) {
    String(question.answer.original_representation)
      .split(',')
      .forEach((l) => correctLettersSet.add(l.trim().toUpperCase()));
  }

  const correctOptionIndices: number[] = [];
  correctLettersSet.forEach((letter) => {
    const idx = optionLetters.indexOf(letter);
    if (idx !== -1) {
      correctOptionIndices.push(idx);
    }
  });

  // NAT evaluation
  const parsedNatUser = parseFloat(natAnswer.trim());
  let isNatCorrect = false;
  if (isNAT && !isNaN(parsedNatUser) && question.answer) {
    const min = typeof question.answer.minimum === 'number' ? question.answer.minimum : null;
    const max = typeof question.answer.maximum === 'number' ? question.answer.maximum : null;
    const val = typeof question.answer.value === 'number' ? question.answer.value : null;

    if (min !== null && max !== null) {
      isNatCorrect = parsedNatUser >= min && parsedNatUser <= max;
    } else if (val !== null) {
      isNatCorrect = Math.abs(parsedNatUser - val) < 0.0001;
    }
  }

  const isOptionCorrect =
    isChecked &&
    correctOptionIndices.length > 0 &&
    selectedOptions.length === correctOptionIndices.length &&
    correctOptionIndices.every((idx) => selectedOptions.includes(idx));

  const isCorrect = isNAT ? isNatCorrect : isOptionCorrect;

  const handleOptionClick = (optIdx: number) => {
    if (isChecked) return;
    if (isMSQ) {
      setSelectedOptions((prev) =>
        prev.includes(optIdx) ? prev.filter((i) => i !== optIdx) : [...prev, optIdx]
      );
    } else {
      setSelectedOptions([optIdx]);
    }
  };

  const handleCheckAnswer = () => {
    let shouldCheck = false;
    let evalCorrect = false;

    if (isNAT) {
      if (natAnswer.trim().length > 0 && !isChecked) {
        shouldCheck = true;
        evalCorrect = isNatCorrect;
      }
    } else {
      if (selectedOptions.length > 0 && !isChecked) {
        shouldCheck = true;
        evalCorrect =
          correctOptionIndices.length > 0 &&
          selectedOptions.length === correctOptionIndices.length &&
          correctOptionIndices.every((idx) => selectedOptions.includes(idx));
      }
    }

    if (shouldCheck) {
      setIsChecked(true);
      // Track attempt
      trackEvent('question_attempt', {
        question_id: question.question_id,
        year: question.year,
        paper_code: question.paper_code,
      });

      // Track solved if correct
      if (evalCorrect) {
        trackEvent('question_solved', {
          question_id: question.question_id,
        });
      }

      // Increment completed questions count for contribution popup trigger
      if (practiceCtx?.incrementCompletedQuestions) {
        practiceCtx.incrementCompletedQuestions();
      }
    }
  };

  let explanationText = '';
  if (typeof question.explanation === 'string' && question.explanation.trim()) {
    explanationText = question.explanation.trim();
  } else if (
    question.explanation &&
    typeof question.explanation === 'object' &&
    typeof question.explanation.text === 'string' &&
    question.explanation.text.trim()
  ) {
    explanationText = question.explanation.text.trim();
  }

  const correctLettersDisplay =
    correctOptionIndices.length > 0
      ? correctOptionIndices.map((i) => optionLetters[i]).join(', ')
      : question.answer?.original_representation || 'Not specified';

  return (
    <>
      <article
        id={`q-${question.question_id}`}
        className="p-4 sm:p-5 rounded-xl border border-black dark:border-white bg-white dark:bg-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] transition-all overflow-hidden"
      >
        {/* Individual Question Breadcrumbs: strictly single-row, compact */}
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-600 dark:text-neutral-400 pb-2 mb-3 border-b border-neutral-200 dark:border-neutral-800 overflow-x-auto no-scrollbar whitespace-nowrap">
          <span className="text-black dark:text-white font-bold shrink-0">BM</span>
          <span className="shrink-0">→</span>
          <span className="px-1.5 py-0.2 rounded bg-black dark:bg-white text-white dark:text-black font-semibold text-[10px] shrink-0">
            {question.year || 'GATE'}
          </span>
          <span className="shrink-0">→</span>
          <span className="truncate max-w-[120px] sm:max-w-none shrink-0">{sectionName}</span>
          <span className="shrink-0">→</span>
          <span className="text-black dark:text-white font-semibold truncate max-w-[150px] sm:max-w-none shrink-0">
            {subtopicName}
          </span>
        </div>

        {/* Question metadata header with consecutive Q1, Q2 numbering and Report Issue button */}
        <div className="flex items-center justify-between gap-2 pb-2 mb-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm sm:text-base text-black dark:text-white">
              Q{displayNumber}
            </span>
            {isChecked && (
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded border ${
                  isCorrect
                    ? 'bg-green-100 text-green-800 border-green-600 dark:bg-green-950 dark:text-green-300 dark:border-green-400'
                    : 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                }`}
              >
                {isCorrect ? 'Correct!' : 'Incorrect'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 font-medium text-black dark:text-white">
            {question.question_type && (
              <span className="px-1.5 py-0.5 rounded border border-black dark:border-white text-[11px] font-semibold">
                {question.question_type}
              </span>
            )}
            {typeof question.marks === 'number' && (
              <span className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                [{question.marks} {question.marks === 1 ? 'Mark' : 'Marks'}]
              </span>
            )}
            {/* Subtle Report Issue button */}
            <button
              type="button"
              onClick={() => setIsReportModalOpen(true)}
              title="Report an issue with this question"
              className="p-1 rounded text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
            >
              <Flag className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Question Body Text */}
        <div className="text-sm sm:text-base leading-relaxed text-black dark:text-white font-normal overflow-x-auto">
          <MathRenderer text={textToRender} />
        </div>

        {/* Image Display / Placeholder if contains_image is true */}
        {question.contains_image && (
          <div className="mt-4 pt-1">
            <QuestionImage
              questionId={question.question_id}
              displayNumber={displayNumber}
            />
          </div>
        )}

        {/* NAT Question: Just blank box and Submit button */}
        {isNAT && (
          <div className="mt-5 pt-3 border-t border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center gap-3">
            <input
              type="text"
              inputMode="decimal"
              disabled={isChecked}
              value={natAnswer}
              onChange={(e) => setNatAnswer(e.target.value)}
              placeholder="Type answer here..."
              className={`w-52 px-3 py-2 text-sm rounded-lg border bg-white dark:bg-black text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none transition-colors ${
                isChecked
                  ? isNatCorrect
                    ? 'border-green-600 dark:border-green-400 bg-green-50 dark:bg-green-950/60 font-bold'
                    : 'border-black dark:border-white bg-black dark:bg-neutral-900 text-white font-bold'
                  : 'border-black dark:border-white focus:ring-1 focus:ring-black dark:focus:ring-white'
              }`}
            />
          </div>
        )}

        {/* Options Display for MCQ/MSQ */}
        {hasOptions && (
          <div className="mt-5 pt-3 border-t border-neutral-100 dark:border-neutral-900 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {question.options!.map((optText, optIdx) => {
              const isThisSelected = selectedOptions.includes(optIdx);
              const isThisCorrect = correctOptionIndices.includes(optIdx);

              let optionStyle =
                'border-neutral-300 dark:border-neutral-700 bg-white dark:bg-black text-black dark:text-white hover:border-black dark:hover:border-white';
              let labelStyle = 'text-black dark:text-white';

              if (!isChecked) {
                if (isThisSelected) {
                  optionStyle =
                    'border-black dark:border-white bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white font-medium shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]';
                  labelStyle = 'text-black dark:text-white font-extrabold';
                }
              } else {
                if (isThisCorrect) {
                  optionStyle =
                    'border-green-600 dark:border-green-500 bg-green-50 dark:bg-green-950 text-green-950 dark:text-green-100 font-semibold shadow-[2px_2px_0px_0px_rgba(22,101,52,1)]';
                  labelStyle = 'text-green-700 dark:text-green-300 font-extrabold';
                } else if (isThisSelected) {
                  optionStyle =
                    'border-black dark:border-white bg-black dark:bg-neutral-900 text-white font-semibold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]';
                  labelStyle = 'text-white font-extrabold';
                } else {
                  optionStyle =
                    'border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950 text-neutral-400 dark:text-neutral-500 cursor-default';
                  labelStyle = 'text-neutral-400 dark:text-neutral-500';
                }
              }

              return (
                <button
                  key={optIdx}
                  type="button"
                  disabled={isChecked}
                  onClick={() => handleOptionClick(optIdx)}
                  className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-left transition-all ${
                    isChecked ? 'cursor-default' : 'cursor-pointer'
                  } ${optionStyle}`}
                >
                  <span className={`text-xs sm:text-sm shrink-0 ${labelStyle}`}>
                    ({optionLetters[optIdx] || optIdx + 1})
                  </span>
                  <div className="flex-1 leading-snug text-xs sm:text-sm overflow-x-auto">
                    <MathRenderer text={optText} />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Bottom Action Buttons: Bottom-left Explanation, Bottom-right Submit / Check Answer */}
        <div className="mt-5 pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3">
          {/* Bottom-left: Explanation button */}
          <button
            type="button"
            onClick={() => setIsExplanationOpen((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-black dark:border-white bg-white dark:bg-black text-black dark:text-white font-bold text-xs hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
          >
            <span>Explanation</span>
            {isExplanationOpen ? (
              <ChevronUp className="w-3.5 h-3.5 stroke-[2.5]" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
            )}
          </button>

          {/* Bottom-right: Submit button for NAT */}
          {isNAT && natAnswer.trim().length > 0 && !isChecked && (
            <button
              type="button"
              onClick={handleCheckAnswer}
              className="px-3.5 py-1.5 rounded-lg border border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-extrabold text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:opacity-90 transition-opacity cursor-pointer"
            >
              Submit
            </button>
          )}

          {/* Bottom-right: Check Answer button for MCQ / MSQ */}
          {hasOptions && selectedOptions.length > 0 && !isChecked && (
            <button
              type="button"
              onClick={handleCheckAnswer}
              className="px-3.5 py-1.5 rounded-lg border border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-extrabold text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:opacity-90 transition-opacity cursor-pointer"
            >
              Check Answer
            </button>
          )}
        </div>

        {/* Expanded Explanation Area */}
        {isExplanationOpen && (
          <div className="mt-4 p-4 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-xs sm:text-sm text-black dark:text-white transition-all">
            <div className="font-extrabold text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
              Explanation & Solution
            </div>

            {isChecked && (
              <div className="mb-3 p-2 rounded-lg bg-green-50 dark:bg-green-950/80 border border-green-500 text-green-900 dark:text-green-200 font-semibold text-xs">
                <span>Correct Answer: </span>
                <span className="font-extrabold text-sm">
                  {isNAT
                    ? question.answer?.original_representation ||
                      (question.answer?.minimum !== null && question.answer?.maximum !== null
                        ? `${question.answer?.minimum} to ${question.answer?.maximum}`
                        : question.answer?.value ?? 'Not specified')
                    : `Option (${correctLettersDisplay})`}
                </span>
              </div>
            )}

            {explanationText ? (
              <div className="leading-relaxed font-normal">
                <MathRenderer text={explanationText} />
              </div>
            ) : (
              <p className="italic text-neutral-500 dark:text-neutral-400">
                Explanation not available yet.
              </p>
            )}

            {/* Report an issue button directly below explanation */}
            <div className="mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-800 flex justify-end">
              <button
                type="button"
                onClick={() => setIsReportModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 border border-neutral-300 dark:border-neutral-700 transition-colors cursor-pointer"
              >
                <Flag className="w-3 h-3" />
                <span>Report an issue</span>
              </button>
            </div>
          </div>
        )}
      </article>

      {/* Report Issue Popup Modal */}
      <ReportIssueModal
        question={question}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        sectionName={sectionName}
        subtopicName={subtopicName}
      />
    </>
  );
};
