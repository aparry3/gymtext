'use client';

/**
 * Questionnaire
 *
 * Main orchestrator component for the full-page questionnaire flow.
 */

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { QuestionnaireQuestion } from '@/lib/questionnaire/types';
import { useQuestionnaire, clearQuestionnaireState } from '@/lib/questionnaire/useQuestionnaire';
import { QuestionnaireProgress } from './QuestionnaireProgress';
import { QuestionCard } from './QuestionCard';
import { SingleSelectQuestion } from './questions/SingleSelectQuestion';
import { MultiSelectQuestion } from './questions/MultiSelectQuestion';
import { TextInputQuestion } from './questions/TextInputQuestion';
import { BooleanQuestion } from './questions/BooleanQuestion';

interface QuestionnaireProps {
  programId?: string;
  questions: QuestionnaireQuestion[];
}

export function Questionnaire({ programId, questions }: QuestionnaireProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    currentQuestion,
    currentIndex,
    totalQuestions,
    answers,
    direction,
    setAnswer,
    goNext,
    goBack,
    canGoBack,
    isComplete,
    hasValidAnswer,
  } = useQuestionnaire({ programId, questions });

  const handleNext = useCallback(() => {
    if (isComplete && hasValidAnswer) {
      handleSubmit();
    } else if (hasValidAnswer) {
      goNext();
    }
  }, [isComplete, hasValidAnswer, goNext]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Transform answers to match signup API
      const phoneDigits = (answers.phone as string) || '';
      const phoneNumber = phoneDigits.startsWith('+1') ? phoneDigits : `+1${phoneDigits}`;

      // Extract program-specific answers
      const programAnswers: Record<string, string | string[]> = {};
      Object.entries(answers).forEach(([key, value]) => {
        if (key.startsWith('program_')) {
          programAnswers[key.replace('program_', '')] = value;
        }
      });

      const formData = {
        // User info
        name: answers.name as string,
        phoneNumber,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        preferredSendHour: 8,
        gender: 'prefer_not_to_say',

        // Fitness data
        primaryGoals: answers.goals as string[],
        experienceLevel: answers.experience as string,
        desiredDaysPerWeek: answers.days as string,
        trainingLocation: answers.location as string,
        equipment: answers.equipment as string[],
        acceptedRisks: true,

        // Program info
        ...(programId && { programId }),
        ...(Object.keys(programAnswers).length > 0 && { programAnswers }),
      };

      const response = await fetch('/api/users/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create account');
      }

      const { checkoutUrl, redirectUrl } = await response.json();

      // Clear localStorage on success
      clearQuestionnaireState();

      // Redirect to Stripe checkout or /me
      window.location.href = checkoutUrl || redirectUrl;
    } catch (err) {
      console.error('Signup error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  const renderQuestion = () => {
    if (!currentQuestion) return null;

    const currentValue = answers[currentQuestion.id];
    const isLastQuestion = isComplete;

    switch (currentQuestion.type) {
      case 'select':
        return (
          <SingleSelectQuestion
            question={currentQuestion}
            value={currentValue as string | undefined}
            onChange={(v) => setAnswer(v)}
            onNext={handleNext}
          />
        );

      case 'multiselect':
        return (
          <MultiSelectQuestion
            question={currentQuestion}
            value={currentValue as string[] | undefined}
            onChange={(v) => setAnswer(v)}
            onNext={handleNext}
          />
        );

      case 'text':
      case 'phone':
        return (
          <TextInputQuestion
            question={currentQuestion}
            value={currentValue as string | undefined}
            onChange={(v) => setAnswer(v)}
            onNext={handleNext}
            isSubmit={isLastQuestion}
            isLoading={isSubmitting}
          />
        );

      case 'boolean':
        return (
          <BooleanQuestion
            question={currentQuestion}
            value={currentValue as string | undefined}
            onChange={(v) => setAnswer(v)}
            onNext={handleNext}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="questionnaire-theme flex min-h-screen-safe flex-col bg-[hsl(var(--questionnaire-bg))]">
      {/* Header with progress */}
      <header className="flex-shrink-0 pt-safe">
        <div className="flex items-center justify-between px-4 py-4">
          {/* Back button */}
          <button
            type="button"
            onClick={goBack}
            disabled={!canGoBack}
            className={`
              rounded-full p-2 transition-opacity
              ${canGoBack ? 'opacity-100' : 'opacity-0 pointer-events-none'}
            `}
            aria-label="Go back"
          >
            <svg
              className="h-6 w-6 text-[hsl(var(--questionnaire-foreground))]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Question counter */}
          <span className="text-sm text-[hsl(var(--questionnaire-muted-foreground))]">
            {currentIndex + 1} of {totalQuestions}
          </span>

          {/* Placeholder for balance */}
          <div className="w-10" />
        </div>

        <QuestionnaireProgress currentIndex={currentIndex} totalQuestions={totalQuestions} />
      </header>

      {/* Main content */}
      <main className="flex flex-1 flex-col justify-center px-6 py-8 pb-safe">
        <div className="mx-auto w-full max-w-md">
          {error && (
            <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 p-4">
              <p className="text-red-400 text-center">{error}</p>
            </div>
          )}

          <QuestionCard direction={direction} questionKey={currentQuestion?.id || 'loading'}>
            {renderQuestion()}
          </QuestionCard>
        </div>
      </main>
    </div>
  );
}
