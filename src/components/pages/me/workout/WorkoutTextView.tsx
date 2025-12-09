'use client';

interface WorkoutTextViewProps {
  formatted?: string;
  description?: string;
}

export function WorkoutTextView({ formatted, description }: WorkoutTextViewProps) {
  const content = formatted || description;

  if (!content) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No text content available for this workout.</p>
      </div>
    );
  }

  return (
    <div className="prose prose-sm max-w-none">
      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground bg-muted/30 p-4 rounded-lg">
        {content}
      </pre>
    </div>
  );
}
