import type { ToolResult } from '../types/shared';
import type { Message } from '@/server/models/message';
/**
 * ProfileService - Orchestration service for profile and user field agents
 *
 * Handles profile updates via the profile agent AND user field updates
 * (timezone, send time, name) via the user fields agent.
 * Both agents run in parallel for efficiency.
 *
 * Uses entity services (UserService, FitnessProfileService) for data access.
 *
 * This is an ORCHESTRATION service - it coordinates agent calls.
 * For entity CRUD operations, use FitnessProfileService directly.
 */
export declare class ProfileService {
    /**
     * Update profile and user fields from a user message
     *
     * Runs both agents in parallel:
     * 1. Profile agent - updates the fitness profile dossier
     * 2. User fields agent - extracts timezone, send time, and name changes
     *
     * Fetches context via entity services, calls both agents,
     * persists updates, and returns a standardized ToolResult.
     *
     * @param userId - The user's ID
     * @param message - The user's message to extract info from
     * @param previousMessages - Optional conversation history for context
     * @returns ToolResult with response summary and optional messages
     */
    static updateProfile(userId: string, message: string, previousMessages?: Message[]): Promise<ToolResult>;
}
//# sourceMappingURL=index.d.ts.map