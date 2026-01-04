/**
 * Build user profile context string
 *
 * @param profile - User's markdown profile (pre-fetched from user object)
 * @returns Formatted context string with XML tags
 */
export const buildUserProfileContext = (profile) => {
    if (!profile || profile.trim().length === 0) {
        return '<UserProfile>No profile available</UserProfile>';
    }
    return `<UserProfile>${profile.trim()}</UserProfile>`;
};
