'use client';

import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { BMQuestion } from '@/lib/bmData';

interface ReportIssueModalProps {
  question: BMQuestion;
  isOpen: boolean;
  onClose: () => void;
  sectionName?: string;
  subtopicName?: string;
}

export const ReportIssueModal: React.FC<ReportIssueModalProps> = ({
  question,
  isOpen,
  onClose,
  sectionName,
  subtopicName,
}) => {
  const [description, setDescription] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMessage('Please describe the problem before submitting.');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    const reportPayload = {
      question_id: question.question_id,
      branch: question.paper_code || 'BM',
      year: question.year,
      section_name: sectionName || question.section_name,
      subtopic_name: subtopicName || question.topic_name,
      reason: 'Question Issue',
      message: description.trim(),
    };

    fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportPayload),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to submit report');
        }
        return res.json();
      })
      .then(() => {
        setIsSubmitting(false);
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          setDescription('');
          onClose();
        }, 1500);
      })
      .catch((err) => {
        console.error('Error submitting report:', err);
        setIsSubmitting(false);
        setErrorMessage('Failed to submit report. Please try again.');
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md rounded-xl border border-black dark:border-white bg-white dark:bg-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-black dark:text-white" />
            <h3 className="font-extrabold text-sm sm:text-base text-black dark:text-white">
              Report an Issue
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-black dark:text-white" />
          </button>
        </div>

        {/* Short Instruction */}
        <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3">
          Please describe any problem with the question, answer, explanation, image, or mathematical notation:
        </p>

        {isSuccess ? (
          <div className="py-6 text-center">
            <p className="text-xs sm:text-sm font-bold text-black dark:text-white">
              Thank you! Your feedback has been noted.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              placeholder="e.g. In option (B), the formula should have a plus sign instead of minus..."
              className="w-full p-2.5 text-xs sm:text-sm rounded-lg border border-black dark:border-white bg-white dark:bg-black text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white resize-none"
            />

            {errorMessage && (
              <p className="mt-1 text-[11px] font-semibold text-red-600 dark:text-red-400">
                {errorMessage}
              </p>
            )}

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-black text-black dark:text-white text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-3.5 py-1.5 rounded-lg border border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-extrabold text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Send Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
