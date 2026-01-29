'use client';

/**
 * useQuestionnaire Hook
 *
 * Custom hook for managing questionnaire state with localStorage persistence.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import type { QuestionnaireQuestion, QuestionnaireState } from './types';
import { STORAGE_KEY } from './types';

interface UseQuestionnaireOptions {
  programId?: string;
  questions: QuestionnaireQuestion[];
}

interface UseQuestionnaireReturn {
  /** Current question object */
  currentQuestion: QuestionnaireQuestion;
  /** Current question index (0-based) */
  currentIndex: number;
  /** Total number of questions */
  totalQuestions: number;
  /** All collected answers */
  answers: Record<string, string | string[]>;
  /** Animation direction */
  direction: 'forward' | 'backward';
  /** Set answer for current question */
  setAnswer: (value: string | string[]) => void;
  /** Advance to next question (or trigger submit if on last) */
  goNext: () => void;
  /** Go to previous question */
  goBack: () => void;
  /** Whether we can go back */
  canGoBack: boolean;
  /** Whether we're on the last question */
  isComplete: boolean;
  /** Whether current question has a valid answer */
  hasValidAnswer: boolean;
  /** Clear state and restart */
  reset: () => void;
  /** Whether state was restored from localStorage */
  wasRestored: boolean;
}

/**
 * Load state from localStorage
 */
function loadState(programId?: string): QuestionnaireState | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const state = JSON.parse(stored) as QuestionnaireState;

    // If program ID doesn't match, don't restore
    if (state.programId !== programId) {
      return null;
    }

    return state;
  } catch {
    return null;
  }
}

/**
 * Save state to localStorage
 */
function saveState(state: QuestionnaireState): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Clear state from localStorage
 */
function clearState(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}

export function useQuestionnaire({ programId, questions }: UseQuestionnaireOptions): UseQuestionnaireReturn {
  const [state, setState] = useState<QuestionnaireState>(() => {
    // Try to restore from localStorage
    const restored = loadState(programId);
    if (restored && restored.questions.length === questions.length) {
      return restored;
    }

    // Initialize fresh state
    return {
      programId,
      questions,
      currentIndex: 0,
      answers: {},
      direction: 'forward',
    };
  });

  const wasRestored = useRef(false);

  // Check if state was restored on initial load
  useEffect(() => {
    const restored = loadState(programId);
    if (restored && restored.questions.length === questions.length && restored.currentIndex > 0) {
      wasRestored.current = true;
    }
  }, []);

  // Persist state changes to localStorage
  useEffect(() => {
    saveState(state);
  }, [state]);

  const currentQuestion = state.questions[state.currentIndex];
  const currentAnswer = state.answers[currentQuestion?.id];

  const hasValidAnswer = useCallback(() => {
    if (!currentQuestion) return false;

    const answer = state.answers[currentQuestion.id];

    if (!currentQuestion.required) return true;

    if (answer === undefined || answer === null) return false;

    if (Array.isArray(answer)) {
      return answer.length > 0;
    }

    return typeof answer === 'string' && answer.trim().length > 0;
  }, [currentQuestion, state.answers]);

  const setAnswer = useCallback((value: string | string[]) => {
    setState((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [prev.questions[prev.currentIndex].id]: value,
      },
    }));
  }, []);

  const goNext = useCallback(() => {
    setState((prev) => {
      if (prev.currentIndex >= prev.questions.length - 1) {
        return prev; // Already at last question
      }

      return {
        ...prev,
        currentIndex: prev.currentIndex + 1,
        direction: 'forward',
      };
    });
  }, []);

  const goBack = useCallback(() => {
    setState((prev) => {
      if (prev.currentIndex <= 0) {
        return prev; // Already at first question
      }

      return {
        ...prev,
        currentIndex: prev.currentIndex - 1,
        direction: 'backward',
      };
    });
  }, []);

  const reset = useCallback(() => {
    clearState();
    setState({
      programId,
      questions,
      currentIndex: 0,
      answers: {},
      direction: 'forward',
    });
  }, [programId, questions]);

  return {
    currentQuestion,
    currentIndex: state.currentIndex,
    totalQuestions: state.questions.length,
    answers: state.answers,
    direction: state.direction,
    setAnswer,
    goNext,
    goBack,
    canGoBack: state.currentIndex > 0,
    isComplete: state.currentIndex >= state.questions.length - 1,
    hasValidAnswer: hasValidAnswer(),
    reset,
    wasRestored: wasRestored.current,
  };
}

/**
 * Clear questionnaire state (call after successful submission)
 */
export function clearQuestionnaireState(): void {
  clearState();
}
