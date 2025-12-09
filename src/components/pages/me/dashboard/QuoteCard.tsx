'use client';

import { Card } from '@/components/ui/card';

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
      <Card className="p-4 bg-card animate-pulse">
        <div className="space-y-3">
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-3/4 bg-muted rounded" />
          <div className="h-3 w-24 bg-muted rounded mt-2" />
        </div>
      </Card>
    );
  }

  // Use provided quote or select a random default
  const quote = text
    ? { text, author: author || 'Unknown' }
    : DEFAULT_QUOTES[Math.floor(Math.random() * DEFAULT_QUOTES.length)];

  return (
    <Card className="p-4 bg-card">
      <div className="relative">
        {/* Quote marks */}
        <div className="absolute -top-1 -left-1 text-4xl text-[hsl(var(--sidebar-accent))]/20 font-serif">
          &ldquo;
        </div>

        <p className="text-sm italic text-foreground leading-relaxed pl-4">
          {quote.text}
        </p>

        <p className="text-xs text-[hsl(var(--sidebar-accent))] font-medium mt-3 pl-4">
          &mdash; {quote.author}
        </p>
      </div>
    </Card>
  );
}
