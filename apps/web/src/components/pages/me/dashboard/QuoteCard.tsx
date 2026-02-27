'use client';

interface QuoteCardProps {
  isLoading?: boolean;
}

// Pool of static motivational fitness quotes
const QUOTES = [
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
  {
    text: 'The body achieves what the mind believes.',
    author: 'Napoleon Hill',
  },
  {
    text: 'Success usually comes to those who are too busy to be looking for it.',
    author: 'Henry David Thoreau',
  },
  {
    text: 'Take care of your body. It\'s the only place you have to live.',
    author: 'Jim Rohn',
  },
  {
    text: 'The hard days are what make you stronger.',
    author: 'Aly Raisman',
  },
  {
    text: 'You don\'t have to be extreme, just consistent.',
    author: 'Unknown',
  },
  {
    text: 'What seems impossible today will one day become your warm-up.',
    author: 'Unknown',
  },
  {
    text: 'The pain you feel today will be the strength you feel tomorrow.',
    author: 'Arnold Schwarzenegger',
  },
];

// Select a quote deterministically based on the current day
function getDailyQuote(): { text: string; author: string } {
  const now = new Date();
  // Use year + dayOfYear as seed so it stays stable within a day
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const seed = now.getFullYear() * 1000 + dayOfYear;
  return QUOTES[seed % QUOTES.length];
}

export function QuoteCard({ isLoading = false }: QuoteCardProps) {
  if (isLoading) {
    return (
      <div className="p-5 rounded-xl bg-white border border-stone-200 animate-pulse">
        <div className="space-y-3">
          <div className="h-4 w-full bg-stone-200 rounded" />
          <div className="h-4 w-3/4 bg-stone-200 rounded" />
          <div className="h-3 w-24 bg-stone-200 rounded mt-2" />
        </div>
      </div>
    );
  }

  const quote = getDailyQuote();

  return (
    <div className="p-5 rounded-xl bg-white border border-stone-200 flex flex-col justify-center">
      <p className="text-sm italic text-stone-700 leading-relaxed mb-2">
        &ldquo;{quote.text}&rdquo;
      </p>
      <p className="text-xs text-stone-400">
        &mdash; {quote.author}
      </p>
    </div>
  );
}
