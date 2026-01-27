/**
 * Build available exercises context string
 *
 * @param exercises - List of active exercises with names
 * @returns Formatted context string with XML tags
 */
export const buildExercisesContext = (
  exercises: { name: string }[] | null | undefined
): string => {
  if (!exercises || exercises.length === 0) {
    return '';
  }
  const names = exercises.map(ex => `- ${ex.name}`).join('\n');
  return `<AvailableExercises>\nExercises Available:\n${names}\n</AvailableExercises>`;
};
