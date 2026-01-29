'use client';

/**
 * Start Page
 *
 * Full-page questionnaire for new user signup.
 * Supports optional program parameter for program-specific questions.
 */

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Questionnaire } from '@/components/questionnaire/Questionnaire';
import type { QuestionnaireQuestion } from '@/lib/questionnaire/types';
import { baseQuestions } from '@/lib/questionnaire/baseQuestions';

function LoadingSpinner() {
  return (
    <div className="questionnaire-theme flex min-h-screen-safe flex-col items-center justify-center bg-[hsl(var(--questionnaire-bg))]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[hsl(var(--questionnaire-accent))] border-t-transparent" />
        <span className="text-[hsl(var(--questionnaire-muted-foreground))]">Loading...</span>
      </div>
    </div>
  );
}

function StartPageContent() {
  const searchParams = useSearchParams();
  const programId = searchParams.get('program') || undefined;

  const [questions, setQuestions] = useState<QuestionnaireQuestion[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadQuestions() {
      if (!programId) {
        // No program, use base questions only
        setQuestions(baseQuestions);
        return;
      }

      try {
        // Fetch questions including program-specific ones
        const response = await fetch(`/api/start/questions?programId=${programId}`);

        if (!response.ok) {
          // Fall back to base questions if program not found
          console.warn('Could not load program questions, using base questions');
          setQuestions(baseQuestions);
          return;
        }

        const data = await response.json();
        setQuestions(data.questions);
      } catch (err) {
        console.error('Error loading questions:', err);
        setError('Failed to load questionnaire');
      }
    }

    loadQuestions();
  }, [programId]);

  if (error) {
    return (
      <div className="questionnaire-theme flex min-h-screen-safe flex-col items-center justify-center bg-[hsl(var(--questionnaire-bg))] px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[hsl(var(--questionnaire-foreground))]">Something went wrong</h1>
          <p className="mt-2 text-[hsl(var(--questionnaire-muted-foreground))]">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-xl bg-[hsl(var(--questionnaire-accent))] px-6 py-3 font-medium text-white"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!questions) {
    return <LoadingSpinner />;
  }

  return <Questionnaire programId={programId} questions={questions} />;
}

export default function StartPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <StartPageContent />
    </Suspense>
  );
}
