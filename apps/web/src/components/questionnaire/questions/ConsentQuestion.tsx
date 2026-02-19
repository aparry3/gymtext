'use client';

import { useState } from 'react';
import { ContinueButton } from '../ContinueButton';
import type { QuestionnaireQuestion } from '@/lib/questionnaire/types';

interface ConsentQuestionProps {
  question: QuestionnaireQuestion;
  value?: boolean;
  onChange: (value: boolean) => void;
  onNext: () => void;
}

export function ConsentQuestion({ question, value, onChange, onNext }: ConsentQuestionProps) {
  const [error, setError] = useState<string | null>(null);
  const isChecked = value === true;

  const handleCheckboxChange = (checked: boolean) => {
    onChange(checked);
    setError(null);
  };

  const handleContinue = () => {
    if (!isChecked && question.required) {
      setError('You must consent to receive text messages to use GymText');
      return;
    }
    onNext();
  };

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

      {/* Consent text with links */}
      {question.metadata?.consentText && (
        <div
          className="text-sm text-[hsl(var(--questionnaire-muted-foreground))] leading-relaxed"
          dangerouslySetInnerHTML={{ __html: question.metadata.consentText }}
        />
      )}

      {/* Checkbox */}
      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={(e) => handleCheckboxChange(e.target.checked)}
          className="mt-1 h-5 w-5 rounded border-2 border-[hsl(var(--questionnaire-muted))] 
                   checked:bg-[hsl(var(--questionnaire-accent))] 
                   checked:border-[hsl(var(--questionnaire-accent))]
                   focus:ring-2 focus:ring-[hsl(var(--questionnaire-accent))] focus:ring-offset-2
                   transition-colors cursor-pointer"
        />
        <span className="text-[hsl(var(--questionnaire-foreground))] font-medium select-none">
          {question.metadata?.checkboxLabel || 'I consent'}
        </span>
      </label>

      {/* Error message */}
      {error && (
        <div className="text-sm text-red-500 font-medium">
          {error}
        </div>
      )}

      <div className="mt-4">
        <ContinueButton
          onClick={handleContinue}
          disabled={!isChecked && question.required}
        />
      </div>
    </div>
  );
}
