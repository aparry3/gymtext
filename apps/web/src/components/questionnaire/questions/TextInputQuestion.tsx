'use client';

/**
 * TextInputQuestion
 *
 * Text input question with Continue button.
 */

import { useState, useEffect, useRef } from 'react';
import type { QuestionnaireQuestion } from '@/lib/questionnaire/types';
import { ContinueButton } from '../ContinueButton';

interface TextInputQuestionProps {
  question: QuestionnaireQuestion;
  value: string | undefined;
  onChange: (value: string) => void;
  onNext: () => void;
  isSubmit?: boolean;
  isLoading?: boolean;
}

/**
 * Format phone number as user types
 */
function formatPhoneNumber(value: string): string {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');

  // Format as (XXX) XXX-XXXX
  if (digits.length <= 3) {
    return digits;
  } else if (digits.length <= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  } else {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  }
}

/**
 * Extract digits from formatted phone
 */
function getPhoneDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export function TextInputQuestion({
  question,
  value = '',
  onChange,
  onNext,
  isSubmit = false,
  isLoading = false,
}: TextInputQuestionProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isPhone = question.type === 'phone';
  const [displayValue, setDisplayValue] = useState(isPhone ? formatPhoneNumber(value) : value);

  // Sync displayValue when question changes or value prop changes
  useEffect(() => {
    setDisplayValue(isPhone ? formatPhoneNumber(value) : value);
  }, [question.id, value, isPhone]);

  // Focus input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, [question.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    if (isPhone) {
      const digits = getPhoneDigits(newValue);
      if (digits.length <= 10) {
        setDisplayValue(formatPhoneNumber(digits));
        onChange(digits);
      }
    } else {
      setDisplayValue(newValue);
      onChange(newValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && canContinue) {
      e.preventDefault();
      onNext();
    }
  };

  const canContinue = question.required ? (isPhone ? getPhoneDigits(value).length === 10 : value.trim().length > 0) : true;

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
        <input
          ref={inputRef}
          type={isPhone ? 'tel' : 'text'}
          value={displayValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={question.placeholder}
          autoComplete={isPhone ? 'tel' : 'name'}
          className={`
            w-full rounded-2xl border-2 bg-[hsl(var(--questionnaire-surface))] px-6 py-4
            text-lg text-[hsl(var(--questionnaire-foreground))]
            placeholder:text-[hsl(var(--questionnaire-muted-foreground))]
            border-[hsl(var(--questionnaire-border))]
            focus:border-[hsl(var(--questionnaire-accent))] focus:outline-none focus:ring-0
            transition-colors duration-200
          `}
        />
      </div>

      <div className="mt-4">
        <ContinueButton onClick={onNext} disabled={!canContinue} isSubmit={isSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
}
