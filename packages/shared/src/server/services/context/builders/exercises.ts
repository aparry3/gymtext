/**
 * Build available exercises context content (raw, without XML wrapper)
 *
 * @param exercises - List of active exercises with names
 * @returns Raw content string (XML wrapper applied by template)
 */
export const buildExercisesContext = (
  exercises: { name: string }[] | null | undefined
): string => {
  if (!exercises || exercises.length === 0) {
    return '';
  }
  const names = exercises.map(ex => `- ${ex.name}`).join('\n');
  return `Exercises Available:\n${names}`;
};
