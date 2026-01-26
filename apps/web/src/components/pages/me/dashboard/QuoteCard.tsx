'use client';

interface QuoteCardProps {
  text?: string;
  author?: string;
  isLoading?: boolean;
}

// Default quotes to use when no quote is provided
const DEFAULT_QUOTES = [
  {
    text: "Discipline is doing what needs to be done, even if you don't want to do it.",
    author: 'Unknown',
  },
  {
    text: "The only bad workout is the one that didn't happen.",
    author: 'Unknown',
  },
  {
    text: 'Strength does not come from physical capacity. It comes from an indomitable will.',
    author: 'Mahatma Gandhi',
  },
];

export function QuoteCard({ text, author, isLoading = false }: QuoteCardProps) {
  if (isLoading) {
    return (
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 animate-pulse">
        <div className="space-y-3">
          <div className="h-4 w-full bg-slate-800 rounded" />
          <div className="h-4 w-3/4 bg-slate-800 rounded" />
          <div className="h-3 w-24 bg-slate-800 rounded mt-2" />
        </div>
      </div>
    );
  }

  // Use provided quote or select a random default
  const quote = text
    ? { text, author: author || 'Unknown' }
    : DEFAULT_QUOTES[Math.floor(Math.random() * DEFAULT_QUOTES.length)];

  return (
    <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-center">
      <p className="text-sm italic text-slate-300 leading-relaxed mb-2">
        &ldquo;{quote.text}&rdquo;
      </p>
      <p className="text-xs text-slate-500">
        &mdash; {quote.author}
      </p>
    </div>
  );
}
