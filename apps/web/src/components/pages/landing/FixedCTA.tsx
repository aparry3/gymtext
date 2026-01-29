'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function FixedCTA() {
  const [isScrolledPastHero, setIsScrolledPastHero] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Track if scrolled past hero section (approximately 600px)
      const scrollPosition = window.scrollY;
      setIsScrolledPastHero(scrollPosition > 600);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isScrolledPastHero) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 p-4 bg-gradient-to-t from-white via-white to-transparent pointer-events-none">
      <div className="container mx-auto max-w-7xl pointer-events-auto">
        <Button
          asChild
          size="lg"
          className="w-full sm:w-auto sm:ml-auto text-base px-8 py-6 h-auto shadow-xl"
        >
          <Link href="/start">
            Start Working Out Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
