'use client';

/**
 * Questionnaire
 *
 * Main orchestrator component for the full-page questionnaire flow.
 */

import { useState } from 'react';
import Link from 'next/link';
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
  programName?: string;
  ownerWordmarkUrl?: string;
  questions: QuestionnaireQuestion[];
}

export function Questionnaire({ programId, programName, ownerWordmarkUrl, questions }: QuestionnaireProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Track consent separately from questionnaire answers
  const [smsConsent, setSmsConsent] = useState(false);
  const [termsConsent, setTermsConsent] = useState(false);

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

  const handleConsentChange = (sms: boolean, terms: boolean) => {
    setSmsConsent(sms);
    setTermsConsent(terms);
  };

  const handleNext = () => {
    if (isComplete && hasValidAnswer) {
      handleSubmit();
    } else if (hasValidAnswer) {
      goNext();
    }
  };

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

      // Build form data - fitness fields are optional for program signups
      const formData = {
        // User info
        name: answers.name as string,
        phoneNumber,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        preferredSendHour: 8,
        gender: (answers.gender as string) || 'prefer_not_to_say',
        ...(answers.age && { age: parseInt(answers.age as string, 10) }),

        // Fitness data (optional - only present for non-program signups)
        ...(answers.goals && { primaryGoals: answers.goals as string[] }),
        ...(answers.experience && { experienceLevel: answers.experience as string }),
        ...(answers.days && { desiredDaysPerWeek: answers.days as string }),
        ...(answers.location && { trainingLocation: answers.location as string }),
        ...(answers.equipment && { equipment: answers.equipment as string[] }),
        acceptedRisks: true,

        // SMS consent (from phone question checkboxes)
        smsConsent,
        smsConsentedAt: smsConsent ? new Date().toISOString() : undefined,

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
            onConsentChange={currentQuestion.type === 'phone' ? handleConsentChange : undefined}
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
      {/* Branding header */}
      <div className="flex flex-col items-center gap-1 pt-safe mt-6 py-4">
        {ownerWordmarkUrl ? (
          <img src={ownerWordmarkUrl} alt="" className="h-8 object-contain" />
        ) : (
          <img src="/Wordmark.png" alt="GymText" className="h-8 object-contain" />
        )}
        <span className="text-sm text-[hsl(var(--questionnaire-muted-foreground))]">
          {programName || 'Sign Up'}
        </span>
      </div>

      {/* Header with progress */}
      <header className="flex-shrink-0">
        <div className="flex items-center justify-between px-4 py-4">
          {/* Close button - always visible */}
          <Link
            href="/"
            className="rounded-full p-2 transition-opacity hover:opacity-70"
            aria-label="Close and return to home"
          >
            <svg
              className="h-6 w-6 text-[hsl(var(--questionnaire-foreground))]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Link>

          {/* Question counter */}
          <span className="text-sm text-[hsl(var(--questionnaire-muted-foreground))]">
            {currentIndex + 1} of {totalQuestions}
          </span>

          {/* Back button */}
          <button
            type="button"
            onClick={goBack}
            disabled={!canGoBack}
            className={`
              rounded-full p-2 transition-opacity
              ${canGoBack ? 'opacity-100 hover:opacity-70' : 'opacity-0 pointer-events-none'}
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
        </div>

        <QuestionnaireProgress currentIndex={currentIndex} totalQuestions={totalQuestions} />
      </header>

      {/* Main content */}
      <main className="flex flex-1 flex-col justify-center px-6 pt-8 pb-safe-offset-12">
        <div className="mx-auto w-full max-w-md">
          {error && (
            <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4">
              <p className="text-red-600 text-center">{error}</p>
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
