'use client';

/**
 * useScrollDepth Hook
 *
 * Tracks scroll depth milestones (25%, 50%, 75%, 100%).
 * Fires each milestone once per page load.
 */

import { useEffect, useRef } from 'react';
import { trackScrollDepth } from '@/lib/analytics';

const MILESTONES = [25, 50, 75, 100];

export function useScrollDepth() {
  const firedMilestones = useRef(new Set<number>());

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;

      const scrollPercent = Math.round((window.scrollY / scrollHeight) * 100);

      for (const milestone of MILESTONES) {
        if (scrollPercent >= milestone && !firedMilestones.current.has(milestone)) {
          firedMilestones.current.add(milestone);
          trackScrollDepth(milestone);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
}
