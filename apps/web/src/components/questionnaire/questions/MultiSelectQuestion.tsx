'use client';

/**
 * MultiSelectQuestion
 *
 * Multiple selection question with Continue button.
 */

import type { QuestionnaireQuestion } from '@/lib/questionnaire/types';
import { PillButton } from '../PillButton';
import { ContinueButton } from '../ContinueButton';

interface MultiSelectQuestionProps {
  question: QuestionnaireQuestion;
  value: string[] | undefined;
  onChange: (value: string[]) => void;
  onNext: () => void;
}

export function MultiSelectQuestion({ question, value = [], onChange, onNext }: MultiSelectQuestionProps) {
  const handleToggle = (optionValue: string) => {
    const currentValues = value || [];
    const isSelected = currentValues.includes(optionValue);

    if (isSelected) {
      onChange(currentValues.filter((v) => v !== optionValue));
    } else {
      // Check max selections
      if (question.maxSelections && currentValues.length >= question.maxSelections) {
        return;
      }
      onChange([...currentValues, optionValue]);
    }
  };

  const canContinue = value && value.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[hsl(var(--questionnaire-foreground))] sm:text-3xl">
          {question.questionText}
        </h1>
        <p className="mt-2 text-[hsl(var(--questionnaire-muted-foreground))]">
          {question.helpText || 'Select all that apply'}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {question.options?.map((option) => (
          <PillButton
            key={option.value}
            label={option.label}
            description={option.description}
            isSelected={(value || []).includes(option.value)}
            onClick={() => handleToggle(option.value)}
          />
        ))}
      </div>

      <div className="mt-4">
        <ContinueButton onClick={onNext} disabled={!canContinue} />
      </div>
    </div>
  );
}
