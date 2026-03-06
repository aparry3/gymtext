'use client';

/**
 * TimeSelectorQuestion
 *
 * Time picker question for the questionnaire flow.
 * Wraps the TimeSelector UI component, storing value as a string hour.
 */

import React from 'react';
import type { QuestionnaireQuestion } from '@/lib/questionnaire/types';
import { ContinueButton } from '../ContinueButton';

interface TimeSelectorQuestionProps {
  question: QuestionnaireQuestion;
  value: string | undefined;
  onChange: (value: string) => void;
  onNext: () => void;
}

export function TimeSelectorQuestion({ question, value, onChange, onNext }: TimeSelectorQuestionProps) {
  const currentHour = value !== undefined ? parseInt(value, 10) : 6;

  const timeOptions = React.useMemo(() => {
    const options: { value: number; label: string }[] = [];
    options.push({ value: 0, label: '12:00 AM' });
    for (let i = 1; i < 12; i++) {
      options.push({ value: i, label: `${i}:00 AM` });
    }
    options.push({ value: 12, label: '12:00 PM' });
    for (let i = 13; i < 24; i++) {
      options.push({ value: i, label: `${i - 12}:00 PM` });
    }
    return options;
  }, []);

  // Set default value on mount if not yet set
  React.useEffect(() => {
    if (value === undefined) {
      onChange('6');
    }
  }, [value, onChange]);

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

      <div>
        <select
          value={currentHour}
          onChange={(e) => onChange(String(e.target.value))}
          className={`
            w-full rounded-2xl border-2 bg-[hsl(var(--questionnaire-surface))] px-6 py-4
            text-lg text-[hsl(var(--questionnaire-foreground))]
            border-[hsl(var(--questionnaire-border))]
            focus:border-[hsl(var(--questionnaire-accent))] focus:outline-none focus:ring-0
            transition-colors duration-200
          `}
        >
          {timeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        <ContinueButton onClick={onNext} disabled={false} />
      </div>
    </div>
  );
}
