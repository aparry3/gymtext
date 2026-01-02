'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp } from 'lucide-react';

export function FixedCTA() {
  const [isScrolledPastHero, setIsScrolledPastHero] = useState(false);
  const [isSignupVisible, setIsSignupVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Track if scrolled past hero section (approximately 600px)
      const scrollPosition = window.scrollY;
      setIsScrolledPastHero(scrollPosition > 600);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Use Intersection Observer to detect when signup form is visible
    const signupSection = document.getElementById('signup');
    if (!signupSection) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsSignupVisible(entry.isIntersecting);
        });
      },
      {
        threshold: 0.1, // Trigger when 10% of signup form is visible
      }
    );

    observer.observe(signupSection);

    return () => observer.disconnect();
  }, []);

  const scrollToSignup = () => {
    const signupSection = document.getElementById('signup');
    if (signupSection) {
      signupSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Show CTA only when scrolled past hero AND signup form is not visible
  const isVisible = isScrolledPastHero && !isSignupVisible;

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 p-4 bg-gradient-to-t from-white via-white to-transparent pointer-events-none">
      <div className="container mx-auto max-w-7xl pointer-events-auto">
        <Button
          onClick={scrollToSignup}
          size="lg"
          className="w-full sm:w-auto sm:ml-auto text-base px-8 py-6 h-auto shadow-xl"
        >
          Start Working Out Today
          <ArrowUp className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
