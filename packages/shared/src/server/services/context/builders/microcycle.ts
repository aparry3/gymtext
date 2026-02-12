import type { Microcycle } from '@/server/models';

/**
 * Build current microcycle context content (raw, without XML wrapper)
 *
 * @param microcycle - Current microcycle data
 * @returns Raw content string (XML wrapper applied by template)
 */
export const buildMicrocycleContext = (microcycle: Microcycle | null | undefined): string => {
  if (!microcycle) {
    return 'No microcycle available';
  }

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const daysFormatted = (microcycle.days || [])
    .map((day, index) => `${dayNames[index]}: ${day}`)
    .join('\n');

  return `Week Overview: ${microcycle.description || 'N/A'}
Is Deload: ${microcycle.isDeload}
Absolute Week: ${microcycle.absoluteWeek}
Days:
${daysFormatted}`;
};
