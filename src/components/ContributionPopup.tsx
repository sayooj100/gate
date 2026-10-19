'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface PopupConfig {
  enabled: boolean;
  image_url: string;
  button_text: string;
  question_threshold: number;
}

interface QuestionPracticeContextType {
  incrementCompletedQuestions: () => void;
  completedCount: number;
}

const QuestionPracticeContext = createContext<QuestionPracticeContextType | null>(null);

export function QuestionPracticeProvider({ children }: { children: React.ReactNode }) {
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [popupConfig, setPopupConfig] = useState<PopupConfig | null>(null);
  const [showPopup, setShowPopup] = useState<boolean>(false);

  useEffect(() => {
    // Read session storage count
    const sessionSolved = sessionStorage.getItem('om_completed_questions_count');
    if (sessionSolved) {
      setCompletedCount(parseInt(sessionSolved, 10) || 0);
    }

    // Fetch latest popup settings from server
    fetch('/api/contribution-popup')
      .then((res) => res.json())
      .then((data: PopupConfig) => {
        if (data && typeof data.enabled === 'boolean') {
          setPopupConfig(data);
        }
      })
      .catch(() => {});
  }, []);

  const triggerPopupIfEligible = useCallback(
    (newCount: number, config: PopupConfig | null) => {
      if (!config || !config.enabled) return;
      const alreadyShown = sessionStorage.getItem('om_popup_shown_in_session');
      if (alreadyShown === 'true') return;

      const threshold = config.question_threshold || 5;
      if (newCount >= threshold) {
        setShowPopup(true);
        try {
          sessionStorage.setItem('om_popup_shown_in_session', 'true');
        } catch {
          // Ignore
        }
      }
    },
    []
  );

  const incrementCompletedQuestions = useCallback(() => {
    setCompletedCount((prev) => {
      const next = prev + 1;
      try {
        sessionStorage.setItem('om_completed_questions_count', next.toString());
      } catch {
        // Ignore
      }
      triggerPopupIfEligible(next, popupConfig);
      return next;
    });
  }, [popupConfig, triggerPopupIfEligible]);

  const handleClose = () => {
    setShowPopup(false);
  };

  return (
    <QuestionPracticeContext.Provider value={{ incrementCompletedQuestions, completedCount }}>
      {children}
      {showPopup && popupConfig && (
        <ContributionPopupModal
          config={popupConfig}
          onClose={handleClose}
        />
      )}
    </QuestionPracticeContext.Provider>
  );
}

export function useQuestionPractice() {
  const ctx = useContext(QuestionPracticeContext);
  return ctx;
}

import Image from 'next/image';
import Link from 'next/link';
import { X } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

function ContributionPopupModal({
  config,
  onClose,
}: {
  config: PopupConfig;
  onClose: () => void;
}) {
  const handleButtonClick = () => {
    trackEvent('contribution_click', { source: 'popup_modal' });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative flex flex-col items-center max-w-[92vw] sm:max-w-md max-h-[90vh]">
        {/* Floating Close button in upper right */}
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-3.5 -right-3.5 z-10 p-1.5 rounded-full bg-black dark:bg-white text-white dark:text-black border border-white dark:border-black shadow-md hover:scale-105 transition-transform cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Seamless Image fitting naturally without borders */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={config.image_url || '/openmentor-logo.webp'}
          alt="Support OpenMentor"
          className="w-auto h-auto max-w-full max-h-[70vh] object-contain rounded-lg"
        />

        {/* Contribute Button fitting directly beneath the image */}
        <Link
          href="/contribution"
          onClick={handleButtonClick}
          className="w-full mt-3 text-center py-2.5 px-4 rounded-lg bg-black dark:bg-white text-white dark:text-black font-extrabold text-sm border border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer"
        >
          {config.button_text || 'Contribute Now'}
        </Link>
      </div>
    </div>
  );
}
