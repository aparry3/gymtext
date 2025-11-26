/**
 * Profile Update Agent
 *
 * Single agent responsible for maintaining user fitness profiles in Markdown format.
 * Handles all profile updates, date conversions, and lazy pruning of expired constraints.
 */

export type { ProfileUpdateInput, ProfileUpdateOutput } from './types';
export { ProfileUpdateOutputSchema } from './schema';
export { createProfileUpdateAgent, updateProfile } from './chain';
