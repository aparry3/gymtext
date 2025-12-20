/**
 * Build user context string with basic user information
 *
 * @param user - User object with name and optional gender
 * @returns Formatted context string with XML tags
 */
export const buildUserContext = (user: { name?: string | null; gender?: string | null } | null | undefined): string => {
  if (!user) {
    return '<User>No user information available</User>';
  }

  const parts: string[] = [];

  if (user.name) {
    parts.push(`<Name>${user.name}</Name>`);
  }

  if (user.gender) {
    parts.push(`<Gender>${user.gender}</Gender>`);
  }

  if (parts.length === 0) {
    return '<User>No user information available</User>';
  }

  return `<User>\n${parts.join('\n')}\n</User>`;
};
