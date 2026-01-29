'use client';

/**
 * QuestionCard
 *
 * Animated wrapper for question content with slide transitions.
 */

import { useEffect, useState, type ReactNode } from 'react';

interface QuestionCardProps {
  children: ReactNode;
  direction: 'forward' | 'backward';
  questionKey: string;
}

export function QuestionCard({ children, direction, questionKey }: QuestionCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentKey, setCurrentKey] = useState(questionKey);

  useEffect(() => {
    if (questionKey !== currentKey) {
      // Exit animation
      setIsVisible(false);

      // After exit, update key and enter
      const timer = setTimeout(() => {
        setCurrentKey(questionKey);
        setIsVisible(true);
      }, 150);

      return () => clearTimeout(timer);
    } else {
      // Initial mount
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [questionKey, currentKey]);

  const translateClass = !isVisible
    ? direction === 'forward'
      ? 'translate-x-8'
      : '-translate-x-8'
    : 'translate-x-0';

  return (
    <div
      className={`
        transition-all duration-200 ease-out
        ${isVisible ? 'opacity-100' : 'opacity-0'}
        ${translateClass}
      `}
    >
      {children}
    </div>
  );
}
