/**
 * Build user context content (raw, without XML wrapper)
 *
 * @param user - User object with name, optional gender, and optional age
 * @returns Raw content string (XML wrapper applied by template)
 */
export const buildUserContext = (user: { name?: string | null; gender?: string | null; age?: number | null } | null | undefined): string => {
  if (!user) {
    return 'No user information available';
  }

  const parts: string[] = [];

  if (user.name) {
    parts.push(`<Name>${user.name}</Name>`);
  }

  if (user.gender) {
    parts.push(`<Gender>${user.gender}</Gender>`);
  }

  if (user.age) {
    parts.push(`<Age>${user.age}</Age>`);
  }

  if (parts.length === 0) {
    return 'No user information available';
  }

  return parts.join('\n');
};
