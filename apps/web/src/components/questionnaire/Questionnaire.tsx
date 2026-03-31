'use client';

/**
 * Questionnaire
 *
 * Main orchestrator component for the full-page questionnaire flow.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import type { QuestionnaireQuestion } from '@/lib/questionnaire/types';
import { useQuestionnaire, clearQuestionnaireState } from '@/lib/questionnaire/useQuestionnaire';
import {
  trackQuestionnaireStarted,
  trackQuestionnaireStepViewed,
  trackQuestionnaireStepCompleted,
  trackQuestionnaireBackClicked,
  trackQuestionnaireAbandoned,
  trackQuestionnaireCompleted,
  trackQuestionnaireError,
  trackSignupSubmitted,
  trackCheckoutRedirect,
  identifyUser,
} from '@/lib/analytics';
import { QuestionnaireProgress } from './QuestionnaireProgress';
import { QuestionCard } from './QuestionCard';
import { SingleSelectQuestion } from './questions/SingleSelectQuestion';
import { MultiSelectQuestion } from './questions/MultiSelectQuestion';
import { TextInputQuestion } from './questions/TextInputQuestion';
import { BooleanQuestion } from './questions/BooleanQuestion';
import { TimeSelectorQuestion } from './questions/TimeSelectorQuestion';

interface QuestionnaireProps {
  programId?: string;
  programName?: string;
  programLogoUrl?: string;
  programSubheader?: string;
  ownerWordmarkUrl?: string;
  questions: QuestionnaireQuestion[];
}

export function Questionnaire({ programId, programName, programLogoUrl, programSubheader, ownerWordmarkUrl, questions }: QuestionnaireProps) {
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
    wasRestored,
  } = useQuestionnaire({ programId, questions });

  // ─── Analytics: track start ─────────────────────────────────────────
  const hasTrackedStart = useRef(false);
  const questionnaireStartTime = useRef(Date.now());

  useEffect(() => {
    if (!hasTrackedStart.current) {
      hasTrackedStart.current = true;
      questionnaireStartTime.current = Date.now();
      trackQuestionnaireStarted({
        programId,
        programName,
        totalQuestions,
        wasRestored,
      });
    }
  }, [programId, programName, totalQuestions, wasRestored]);

  // ─── Analytics: track step views & time ─────────────────────────────
  const stepStartTime = useRef(Date.now());
  const prevIndex = useRef(currentIndex);

  useEffect(() => {
    if (!currentQuestion) return;

    // Track time on previous step (if this isn't the first render)
    if (prevIndex.current !== currentIndex && prevIndex.current >= 0) {
      const prevQuestion = questions[prevIndex.current];
      if (prevQuestion) {
        trackQuestionnaireStepCompleted({
          stepIndex: prevIndex.current,
          stepId: prevQuestion.id,
          stepType: prevQuestion.type,
          timeOnStepSeconds: Math.round((Date.now() - stepStartTime.current) / 1000),
        });
      }
    }

    stepStartTime.current = Date.now();
    prevIndex.current = currentIndex;

    trackQuestionnaireStepViewed({
      stepIndex: currentIndex,
      stepId: currentQuestion.id,
      stepType: currentQuestion.type,
      totalQuestions,
    });
  }, [currentIndex, currentQuestion, totalQuestions, questions]);

  // ─── Analytics: track abandonment ───────────────────────────────────
  const currentIndexRef = useRef(currentIndex);
  const currentQuestionRef = useRef(currentQuestion);
  currentIndexRef.current = currentIndex;
  currentQuestionRef.current = currentQuestion;

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentQuestionRef.current) {
        trackQuestionnaireAbandoned({
          lastStepIndex: currentIndexRef.current,
          lastStepId: currentQuestionRef.current.id,
          totalQuestions,
          completionPercentage: Math.round((currentIndexRef.current / totalQuestions) * 100),
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [totalQuestions]);

  const handleConsentChange = (sms: boolean, terms: boolean) => {
    setSmsConsent(sms);
    setTermsConsent(terms);
  };

  // ─── Analytics-instrumented navigation ──────────────────────────────
  const handleBack = useCallback(() => {
    const fromIndex = currentIndex;
    goBack();
    // goBack is async via setState, so we estimate the destination
    trackQuestionnaireBackClicked({
      fromStepIndex: fromIndex,
      toStepIndex: Math.max(0, fromIndex - 1),
    });
  }, [currentIndex, goBack]);

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

    // Track questionnaire completion
    trackQuestionnaireCompleted({
      programId,
      totalQuestions,
      totalTimeSeconds: Math.round((Date.now() - questionnaireStartTime.current) / 1000),
    });

    try {
      // Transform answers to match signup API
      const phoneDigits = (answers.phone as string) || '';
      const phoneNumber = phoneDigits.startsWith('+1') ? phoneDigits : `+1${phoneDigits}`;

      // Identify user by phone number for PostHog
      identifyUser(phoneNumber, {
        name: answers.name as string,
        messaging_provider: 'sms',
        ...(programId && { program_id: programId }),
      });

      // Extract program-specific answers
      const programAnswers: Record<string, string | string[]> = {};
      Object.entries(answers).forEach(([key, value]) => {
        if (key.startsWith('program_')) {
          programAnswers[key.replace('program_', '')] = value;
        }
      });

      // Read referral code from cookie or query param
      const refCookie = document.cookie.match(/(?:^|;\s*)gt_ref=([A-Za-z0-9]{6})/)?.[1];
      const refParam = new URLSearchParams(window.location.search).get('ref');
      const referralCode = (refCookie || refParam || '').toUpperCase() || undefined;

      // Read promo code from cookie or query param
      const promoCookie = document.cookie.match(/(?:^|;\s*)gt_promo=([A-Za-z0-9]+)/)?.[1];
      const promoParam = new URLSearchParams(window.location.search).get('promo');
      const promoCode = (promoCookie || promoParam || '').toUpperCase() || undefined;

      // Build form data - fitness fields are optional for program signups
      const formData = {
        // User info
        name: answers.name as string,
        email: answers.email as string,
        phoneNumber,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        preferredSendHour: answers.sendTime ? parseInt(answers.sendTime as string, 10) : 6,
        gender: (answers.gender as string) || 'prefer_not_to_say',
        ...(answers.age && { age: parseInt(answers.age as string, 10) }),

        // Fitness data (optional - only present for non-program signups)
        // Filter out "tell_me_more" sentinel values — these indicate the user chose
        // to elaborate via a follow-up text input rather than selecting a concrete option
        ...(answers.goals && {
          primaryGoals: (answers.goals as string[]).filter(g => g !== 'tell_me_more'),
        }),
        ...(answers.goals_detail && { goalsElaboration: answers.goals_detail as string }),
        ...(answers.experience && answers.experience !== 'tell_me_more' && {
          experienceLevel: answers.experience as string,
        }),
        ...(answers.experience_detail && { experienceElaboration: answers.experience_detail as string }),
        ...(answers.days && answers.days !== 'tell_me_more' && {
          desiredDaysPerWeek: answers.days as string,
        }),
        ...(answers.availability_detail && { availabilityElaboration: answers.availability_detail as string }),
        ...(answers.location && answers.location !== 'tell_me_more' && {
          trainingLocation: answers.location as string,
        }),
        ...(answers.equipment_location_detail && { locationElaboration: answers.equipment_location_detail as string }),
        ...(answers.equipment && { equipment: answers.equipment as string[] }),
        acceptedRisks: true,

        // SMS consent (from phone question checkboxes)
        smsConsent,
        smsConsentedAt: smsConsent ? new Date().toISOString() : undefined,

        // Program info
        ...(programId && { programId }),
        ...(Object.keys(programAnswers).length > 0 && { programAnswers }),
        ...(referralCode && { referralCode }),
        ...(!referralCode && promoCode && { promoCode }),
      };

      // Track signup submission
      trackSignupSubmitted({
        hasProgram: !!programId,
        messagingProvider: 'sms',
      });

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

      // Track checkout redirect
      if (checkoutUrl) {
        trackCheckoutRedirect();
      }

      // Redirect to Stripe checkout or /me
      window.location.href = checkoutUrl || redirectUrl;
    } catch (err) {
      console.error('Signup error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      trackQuestionnaireError({
        stepId: currentQuestion?.id || 'unknown',
        errorMessage,
      });
      setError(errorMessage);
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

      case 'time':
        return (
          <TimeSelectorQuestion
            question={currentQuestion}
            value={currentValue as string | undefined}
            onChange={(v) => setAnswer(v)}
            onNext={handleNext}
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
      {/* Close button - top left */}
      <div className="pt-safe mt-2 px-4">
        <Link
          href="/"
          className="inline-flex rounded-full p-2 transition-opacity hover:opacity-70"
          aria-label="Close and return to home"
        >
          <svg
            className="h-5 w-5 text-[hsl(var(--questionnaire-muted-foreground))]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Link>
      </div>

      {/* Branding header */}
      <div className="flex flex-col items-center gap-1 py-4">
        {programLogoUrl ? (
          <>
            <img src={programLogoUrl} alt={programName || ''} className="h-16 object-contain mb-1" />
            {programName && (
              <h2 className="text-lg font-bold text-[hsl(var(--questionnaire-foreground))]">
                {programName}
              </h2>
            )}
            {programSubheader && (
              <p className="text-sm text-[hsl(var(--questionnaire-muted-foreground))]">
                {programSubheader}
              </p>
            )}
            <div className="flex items-center gap-1.5 mt-2 text-xs text-[hsl(var(--questionnaire-muted-foreground))]">
              <span>Powered by</span>
              <img src="/Wordmark.png" alt="GymText" className="h-4 object-contain" />
            </div>
          </>
        ) : ownerWordmarkUrl ? (
          <>
            <img src={ownerWordmarkUrl} alt="" className="h-8 object-contain" />
            <span className="text-sm text-[hsl(var(--questionnaire-muted-foreground))]">
              {programName || 'Sign Up'}
            </span>
          </>
        ) : (
          <>
            <img src="/Wordmark.png" alt="GymText" className="h-8 object-contain" />
            <span className="text-sm text-[hsl(var(--questionnaire-muted-foreground))]">
              {programName || 'Sign Up'}
            </span>
          </>
        )}
      </div>

      {/* Header with progress */}
      <header className="flex-shrink-0">
        <div className="flex items-center justify-between px-4 py-4">
          {/* Back button - left */}
          <button
            type="button"
            onClick={handleBack}
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

          {/* Question counter */}
          <span className="text-sm text-[hsl(var(--questionnaire-muted-foreground))]">
            {currentIndex + 1} of {totalQuestions}
          </span>

          {/* Forward button - right, only visible if current question already answered */}
          <button
            type="button"
            onClick={handleNext}
            className={`
              rounded-full p-2 transition-opacity
              ${hasValidAnswer ? 'opacity-100 hover:opacity-70' : 'opacity-0 pointer-events-none'}
            `}
            aria-label="Go forward"
          >
            <svg
              className="h-6 w-6 text-[hsl(var(--questionnaire-foreground))]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
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
