'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface QuestionImageProps {
  questionId: string;
  displayNumber: number;
}

/**
 * QuestionImage Component
 *
 * Prepared for future Cloudflare R2 private image integration:
 * - In R2, question images are named using the original question ID:
 *   e.g. `images/questions/<QUESTION_ID>.webp`
 * - When an image fails to load or is not yet available, falls back to `error.webp`.
 * - Prevents infinite fallback loops if `error.webp` itself fails.
 */
export const QuestionImage: React.FC<QuestionImageProps> = ({
  questionId,
  displayNumber,
}) => {
  const [imgSrc, setImgSrc] = useState<string>(`/api/images/questions/${questionId}.webp`);
  const [hasFailedOnce, setHasFailedOnce] = useState<boolean>(false);
  const [isCompletelyFailed, setIsCompletelyFailed] = useState<boolean>(false);

  const handleError = () => {
    if (!hasFailedOnce) {
      // First fallback: attempt error.webp
      setHasFailedOnce(true);
      setImgSrc('/error.webp');
    } else {
      // Second fallback failure: stop attempts to prevent infinite loop
      setIsCompletelyFailed(true);
    }
  };

  if (isCompletelyFailed) {
    return (
      <div className="w-full max-w-md mx-auto aspect-[16/9] sm:aspect-[2/1] rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 flex flex-col items-center justify-center p-4 text-center">
        <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
          Figure Placeholder
        </span>
        <span className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1">
          Referenced in Question {displayNumber} ({questionId})
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-md mx-auto aspect-[16/9] sm:aspect-[2/1] rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 overflow-hidden flex items-center justify-center">
      <Image
        src={imgSrc}
        alt={`Figure for Question ${displayNumber}`}
        fill
        sizes="(max-width: 640px) 100vw, 448px"
        className="object-contain p-2"
        onError={handleError}
      />
    </div>
  );
};
