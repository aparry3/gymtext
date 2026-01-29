'use client';

/**
 * QuestionnaireProgress
 *
 * Horizontal segmented progress bar for the questionnaire.
 */

interface QuestionnaireProgressProps {
  currentIndex: number;
  totalQuestions: number;
}

export function QuestionnaireProgress({ currentIndex, totalQuestions }: QuestionnaireProgressProps) {
  return (
    <div className="w-full px-6">
      <div className="flex gap-1.5">
        {Array.from({ length: totalQuestions }).map((_, index) => (
          <div
            key={index}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              index <= currentIndex
                ? 'bg-[hsl(var(--questionnaire-accent))]'
                : 'bg-[hsl(var(--questionnaire-muted))]'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
