'use client';

/**
 * useTrackSection Hook
 *
 * Uses IntersectionObserver to track when a landing page section
 * becomes visible to the user. Fires once per section per page load.
 */

import { useEffect, useRef } from 'react';
import { trackSectionViewed } from '@/lib/analytics';

export function useTrackSection(sectionName: string) {
  const ref = useRef<HTMLDivElement>(null);
  const tracked = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || tracked.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !tracked.current) {
          tracked.current = true;
          trackSectionViewed(sectionName);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [sectionName]);

  return ref;
}
