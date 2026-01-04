/**
 * Markdown Profile Utilities
 *
 * Provides utilities for creating Markdown "Living Dossier" format profiles.
 */
/**
 * Create a default/empty Markdown profile
 * Used when creating a new user with no profile data
 */
export function createEmptyProfile(user) {
    const sections = [];
    // Minimal IDENTITY section
    const identityLines = ['# IDENTITY'];
    if (user?.name) {
        identityLines.push(`**Name:** ${user.name}`);
    }
    if (user?.age) {
        identityLines.push(`**Age:** ${user.age}`);
    }
    sections.push(identityLines.join('\n'));
    return sections.join('\n\n');
}
