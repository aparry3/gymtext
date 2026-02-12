/**
 * Build user profile context content (raw, without XML wrapper)
 *
 * @param profile - User's markdown profile
 * @returns Raw content string (XML wrapper applied by template)
 */
export const buildUserProfileContext = (profile: string | null | undefined): string => {
  if (!profile || profile.trim().length === 0) {
    return 'No profile available';
  }
  return profile.trim();
};
