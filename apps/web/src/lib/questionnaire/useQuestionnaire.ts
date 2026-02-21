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

/**
 * Get the visible questions based on conditional logic
 */
function getVisibleQuestions(
  questions: QuestionnaireQuestion[],
  answers: Record<string, string | string[]>
): QuestionnaireQuestion[] {
  return questions.filter((question) => {
    // Check hide conditions first (these take precedence)
    if (question.hideIfAnswerEquals) {
      const parentAnswer = answers[question.id.replace('_detail', '')];
      const hideValues = Array.isArray(question.hideIfAnswerEquals)
        ? question.hideIfAnswerEquals
        : [question.hideIfAnswerEquals];
      if (hideValues.includes(parentAnswer as string)) {
        return false;
      }
    }

    if (question.hideIfAnswerContains) {
      const parentAnswer = answers[question.id.replace('_detail', '')];
      if (Array.isArray(parentAnswer) && parentAnswer.includes(question.hideIfAnswerContains)) {
        return false;
      }
      // Also check string answers
      if (typeof parentAnswer === 'string' && parentAnswer === question.hideIfAnswerContains) {
        return false;
      }
    }

    // Check show conditions
    if (question.showIfAnswerEquals) {
      const parentAnswer = answers[question.id.replace('_detail', '')];
      return parentAnswer === question.showIfAnswerEquals;
    }

    if (question.showIfAnswerContains) {
      const parentAnswer = answers[question.id.replace('_detail', '')];
      if (Array.isArray(parentAnswer)) {
        return parentAnswer.includes(question.showIfAnswerContains);
      }
      return false;
    }

    return true;
  });
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

  // Get visible questions based on current answers
  const visibleQuestions = getVisibleQuestions(state.questions, state.answers);

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

  const currentQuestion = visibleQuestions[state.currentIndex];
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
      // Find next visible question
      let nextIndex = prev.currentIndex + 1;
      while (nextIndex < prev.questions.length) {
        const question = prev.questions[nextIndex];
        const parentId = question.id.replace('_detail', '');
        const parentAnswer = prev.answers[parentId];

        // Check hide conditions first
        if (question.hideIfAnswerEquals) {
          const hideValues = Array.isArray(question.hideIfAnswerEquals) 
            ? question.hideIfAnswerEquals 
            : [question.hideIfAnswerEquals];
          if (hideValues.includes(parentAnswer as string)) {
            nextIndex++;
            continue;
          }
        }
        if (question.hideIfAnswerContains) {
          if (Array.isArray(parentAnswer) && parentAnswer.includes(question.hideIfAnswerContains)) {
            nextIndex++;
            continue;
          }
          if (typeof parentAnswer === 'string' && parentAnswer === question.hideIfAnswerContains) {
            nextIndex++;
            continue;
          }
        }

        // Check show conditions
        if (question.showIfAnswerEquals) {
          if (parentAnswer !== question.showIfAnswerEquals) {
            nextIndex++;
            continue;
          }
        }
        if (question.showIfAnswerContains) {
          if (!Array.isArray(parentAnswer) || !parentAnswer.includes(question.showIfAnswerContains)) {
            nextIndex++;
            continue;
          }
        }
        // Question is visible, stop here
        break;
      }

      if (nextIndex >= prev.questions.length) {
        return prev; // Already at last question
      }

      return {
        ...prev,
        currentIndex: nextIndex,
        direction: 'forward',
      };
    });
  }, []);

  const goBack = useCallback(() => {
    setState((prev) => {
      // Find previous visible question
      let prevIndex = prev.currentIndex - 1;
      while (prevIndex >= 0) {
        const question = prev.questions[prevIndex];
        const parentId = question.id.replace('_detail', '');
        const parentAnswer = prev.answers[parentId];

        // Check hide conditions
        if (question.hideIfAnswerEquals) {
          const hideValues = Array.isArray(question.hideIfAnswerEquals) 
            ? question.hideIfAnswerEquals 
            : [question.hideIfAnswerEquals];
          if (hideValues.includes(parentAnswer as string)) {
            prevIndex--;
            continue;
          }
        }
        if (question.hideIfAnswerContains) {
          if (Array.isArray(parentAnswer) && parentAnswer.includes(question.hideIfAnswerContains)) {
            prevIndex--;
            continue;
          }
          if (typeof parentAnswer === 'string' && parentAnswer === question.hideIfAnswerContains) {
            prevIndex--;
            continue;
          }
        }

        // Check show conditions (for going back, we show the question if it WAS shown when user was there)
        if (question.showIfAnswerEquals) {
          if (parentAnswer !== question.showIfAnswerEquals) {
            prevIndex--;
            continue;
          }
        }
        if (question.showIfAnswerContains) {
          if (!Array.isArray(parentAnswer) || !parentAnswer.includes(question.showIfAnswerContains)) {
            prevIndex--;
            continue;
          }
        }
        // Question is visible, stop here
        break;
      }

      if (prevIndex < 0) {
        return prev; // Already at first question
      }

      return {
        ...prev,
        currentIndex: prevIndex,
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

  // Calculate visible index for UI display
  const visibleIndex = visibleQuestions.findIndex((q) => q.id === currentQuestion?.id);

  return {
    currentQuestion,
    currentIndex: visibleIndex >= 0 ? visibleIndex : state.currentIndex,
    totalQuestions: visibleQuestions.length,
    answers: state.answers,
    direction: state.direction,
    setAnswer,
    goNext,
    goBack,
    canGoBack: state.currentIndex > 0,
    isComplete: visibleIndex >= visibleQuestions.length - 1,
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
