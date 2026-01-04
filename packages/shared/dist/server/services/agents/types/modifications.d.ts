import { z } from 'zod';
import type { UserWithProfile } from '@/server/models/user';
import type { Message } from '@/server/models/message';
import { WorkoutInstance } from '@/server/models';
import type { AgentConfig } from '@/server/agents';
import type { StructuredToolInterface } from '@langchain/core/tools';
/**
 * Input for the Modifications Agent
 * Contains all context needed to process modification requests
 */
export interface ModificationsAgentInput {
    user: UserWithProfile;
    message: string;
    previousMessages?: Message[];
    currentWorkout?: WorkoutInstance;
    workoutDate: Date;
    targetDay: string;
}
/**
 * Configuration for modifications agent factory
 * Tools are passed at agent creation time, not invoke time.
 */
export interface ModificationsAgentConfig extends AgentConfig {
    /** Tools provided by the calling service */
    tools: StructuredToolInterface[];
}
/**
 * Schema for modifications agent output
 * Conforms to AgentToolResult pattern for use in agentic loop
 */
export declare const ModificationsResponseSchema: z.ZodObject<{
    messages: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    response: z.ZodString;
}, "strip", z.ZodTypeAny, {
    response: string;
    messages?: string[] | undefined;
}, {
    response: string;
    messages?: string[] | undefined;
}>;
export type ModificationsResponse = z.infer<typeof ModificationsResponseSchema>;
//# sourceMappingURL=modifications.d.ts.map