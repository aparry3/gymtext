'use client';

interface WorkoutTextViewProps {
  description?: string;
}

export function WorkoutTextView({ description }: WorkoutTextViewProps) {
  if (!description) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No text content available for this workout.</p>
      </div>
    );
  }

  return (
    <div className="prose prose-sm max-w-none">
      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground bg-muted/30 p-4 rounded-lg">
        {description}
      </pre>
    </div>
  );
}
