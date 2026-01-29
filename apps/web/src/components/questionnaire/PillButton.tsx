'use client';

/**
 * PillButton
 *
 * Option button with selected state for questionnaire choices.
 */

interface PillButtonProps {
  label: string;
  description?: string;
  isSelected: boolean;
  onClick: () => void;
}

export function PillButton({ label, description, isSelected, onClick }: PillButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full rounded-2xl px-6 py-4 text-left transition-all duration-200
        border-2 focus:outline-none focus:ring-2 focus:ring-offset-2
        focus:ring-[hsl(var(--questionnaire-accent))] focus:ring-offset-[hsl(var(--questionnaire-bg))]
        ${
          isSelected
            ? 'border-[hsl(var(--questionnaire-accent))] bg-[hsl(var(--questionnaire-accent))]/10'
            : 'border-[hsl(var(--questionnaire-border))] bg-[hsl(var(--questionnaire-surface))] hover:border-[hsl(var(--questionnaire-muted-foreground))]'
        }
      `}
    >
      <span
        className={`block font-medium ${
          isSelected ? 'text-[hsl(var(--questionnaire-accent))]' : 'text-[hsl(var(--questionnaire-foreground))]'
        }`}
      >
        {label}
      </span>
      {description && (
        <span className="mt-1 block text-sm text-[hsl(var(--questionnaire-muted-foreground))]">{description}</span>
      )}
    </button>
  );
}
