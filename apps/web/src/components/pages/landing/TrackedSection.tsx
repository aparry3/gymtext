'use client';

/**
 * TrackedSection
 *
 * Wrapper that fires a `landing_section_viewed` event when the section
 * scrolls into view (≥50% visible). Fires once per page load.
 */

import { useTrackSection } from '@/hooks/useTrackSection';

interface TrackedSectionProps {
  name: string;
  children: React.ReactNode;
}

export function TrackedSection({ name, children }: TrackedSectionProps) {
  const ref = useTrackSection(name);
  return <div ref={ref}>{children}</div>;
}
