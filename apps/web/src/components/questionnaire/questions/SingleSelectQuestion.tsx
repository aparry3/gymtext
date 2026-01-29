'use client';

/**
 * SingleSelectQuestion
 *
 * Single selection question with Continue button.
 */

import type { QuestionnaireQuestion } from '@/lib/questionnaire/types';
import { PillButton } from '../PillButton';
import { ContinueButton } from '../ContinueButton';

interface SingleSelectQuestionProps {
  question: QuestionnaireQuestion;
  value: string | undefined;
  onChange: (value: string) => void;
  onNext: () => void;
}

export function SingleSelectQuestion({ question, value, onChange, onNext }: SingleSelectQuestionProps) {
  const canContinue = question.required ? !!value : true;

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[hsl(var(--questionnaire-foreground))] sm:text-3xl">
          {question.questionText}
        </h1>
        {question.helpText && (
          <p className="mt-2 text-[hsl(var(--questionnaire-muted-foreground))]">{question.helpText}</p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {question.options?.map((option) => (
          <PillButton
            key={option.value}
            label={option.label}
            description={option.description}
            isSelected={value === option.value}
            onClick={() => onChange(option.value)}
          />
        ))}
      </div>

      <div className="mt-4">
        <ContinueButton onClick={onNext} disabled={!canContinue} />
      </div>
    </div>
  );
}
