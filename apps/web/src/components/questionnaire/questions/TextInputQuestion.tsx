'use client';

/**
 * TextInputQuestion
 *
 * Text input question with Continue button.
 * For phone questions, includes both SMS consent and Terms/Privacy consent checkboxes.
 */

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import type { QuestionnaireQuestion } from '@/lib/questionnaire/types';
import { ContinueButton } from '../ContinueButton';

interface TextInputQuestionProps {
  question: QuestionnaireQuestion;
  value: string | undefined;
  onChange: (value: string) => void;
  onNext: () => void;
  isSubmit?: boolean;
  isLoading?: boolean;
  onConsentChange?: (smsConsent: boolean, termsConsent: boolean) => void;
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
  onConsentChange,
}: TextInputQuestionProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isPhone = question.type === 'phone';
  const [displayValue, setDisplayValue] = useState(isPhone ? formatPhoneNumber(value) : value);
  const [smsConsented, setSmsConsented] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

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

  // Notify parent of consent changes
  useEffect(() => {
    if (isPhone && onConsentChange) {
      onConsentChange(smsConsented, termsAccepted);
    }
  }, [isPhone, smsConsented, termsAccepted, onConsentChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    if (isPhone) {
      let digits = getPhoneDigits(newValue);
      // Strip leading US country code from autofill/paste
      if (digits.length === 11 && digits.startsWith('1')) {
        digits = digits.slice(1);
      }
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

  const hasValidInput = question.required ? (isPhone ? getPhoneDigits(value).length === 10 : value.trim().length > 0) : true;
  // For phone questions, require both consent checkboxes to be checked
  const canContinue = hasValidInput && (isPhone ? smsConsented && termsAccepted : true);

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

      {/* Consent checkboxes - always shown for phone questions */}
      {isPhone && (
        <div className="flex flex-col gap-4">
          {/* SMS Consent with full Twilio disclosures */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={smsConsented}
              onChange={(e) => setSmsConsented(e.target.checked)}
              className="mt-1 h-5 w-5 shrink-0 rounded border-2 border-[hsl(var(--questionnaire-border))] 
                       checked:bg-[hsl(var(--questionnaire-accent))] 
                       checked:border-[hsl(var(--questionnaire-accent))]
                       focus:ring-2 focus:ring-[hsl(var(--questionnaire-accent))] focus:ring-offset-2
                       transition-colors cursor-pointer"
            />
            <span className="text-sm text-[hsl(var(--questionnaire-muted-foreground))] leading-relaxed select-none">
              By checking this box, I agree to receive recurring automated fitness and workout text messages from GymText 
              at the mobile number provided. You will receive daily workout messages. Message frequency may vary. Message 
              and data rates may apply. Reply HELP for help or STOP to cancel. Your mobile information will not be shared 
              with third parties.
            </span>
          </label>

          {/* Terms and Privacy Consent */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-1 h-5 w-5 shrink-0 rounded border-2 border-[hsl(var(--questionnaire-border))] 
                       checked:bg-[hsl(var(--questionnaire-accent))] 
                       checked:border-[hsl(var(--questionnaire-accent))]
                       focus:ring-2 focus:ring-[hsl(var(--questionnaire-accent))] focus:ring-offset-2
                       transition-colors cursor-pointer"
            />
            <span className="text-sm text-[hsl(var(--questionnaire-muted-foreground))] leading-relaxed select-none">
              I agree to the{' '}
              <Link 
                href="/terms" 
                target="_blank" 
                className="text-blue-600 hover:text-blue-700 underline"
                onClick={(e) => e.stopPropagation()}
              >
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link 
                href="/privacy" 
                target="_blank" 
                className="text-blue-600 hover:text-blue-700 underline"
                onClick={(e) => e.stopPropagation()}
              >
                Privacy Policy
              </Link>
            </span>
          </label>
        </div>
      )}

      <div className="mt-4">
        <ContinueButton onClick={onNext} disabled={!canContinue} isSubmit={isSubmit} isLoading={isLoading} />
      </div>

    </div>
  );
}
