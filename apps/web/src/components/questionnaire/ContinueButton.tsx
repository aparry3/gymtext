'use client';

/**
 * ContinueButton
 *
 * Primary action button for advancing through the questionnaire.
 */

interface ContinueButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  isSubmit?: boolean;
}

export function ContinueButton({ onClick, disabled = false, isLoading = false, isSubmit = false }: ContinueButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        w-full rounded-2xl py-4 text-lg font-semibold transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2
        focus:ring-[hsl(var(--questionnaire-accent))] focus:ring-offset-[hsl(var(--questionnaire-bg))]
        ${
          disabled || isLoading
            ? 'bg-[hsl(var(--questionnaire-muted))] text-[hsl(var(--questionnaire-muted-foreground))] cursor-not-allowed'
            : 'bg-[hsl(var(--questionnaire-accent))] text-[hsl(var(--questionnaire-accent-foreground))] hover:opacity-90 active:scale-[0.98]'
        }
      `}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Processing...
        </span>
      ) : isSubmit ? (
        'Start My Journey'
      ) : (
        'Continue'
      )}
    </button>
  );
}
