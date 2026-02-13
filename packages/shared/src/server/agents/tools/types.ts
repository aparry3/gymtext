import type { ZodSchema } from 'zod';
import type { UserWithProfile } from '@/server/models/user';
import type { Message as AgentMessage } from '@/server/agents/types';
import type { ToolResult } from '@/server/services/agents/types/shared';

/**
 * Tool definition for the ToolRegistry
 *
 * Each tool has a name, description, schema (for LLM), priority, and execute function.
 * Tools are thin wrappers that call service methods.
 */
export interface ToolDefinition {
  /** Unique tool name (e.g., 'update_profile') */
  name: string;
  /** Description shown to the LLM */
  description: string;
  /** Zod schema for tool arguments */
  schema: ZodSchema;
  /** Execution priority (lower = runs first). Default: 99 */
  priority?: number;
  /** Execute the tool */
  execute: (ctx: ToolExecutionContext, args: Record<string, unknown>) => Promise<ToolResult>;
}

/**
 * Context available to tool execute functions at invocation time
 *
 * Tools reference ctx.services lazily (not at registration time) to avoid
 * circular dependency issues in factory.ts.
 */
export interface ToolExecutionContext {
  /** The current user */
  user: UserWithProfile;
  /** The user's original message */
  message: string;
  /** Previous conversation messages */
  previousMessages?: AgentMessage[];
  /** Service container (resolved lazily at invocation time) */
  services: ToolServiceContainer;
  /** Extra context (workoutDate, targetDay, etc.) */
  extras?: Record<string, unknown>;
}

/**
 * Subset of ServiceContainer needed by tools
 * Using a separate interface to avoid importing the full ServiceContainer
 * (which would create circular deps).
 *
 * Note: previousMessages uses unknown[] to avoid coupling to specific Message types.
 * The actual services accept their own Message type internally.
 */
export interface ToolServiceContainer {
  profile: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateProfile: (userId: string, message: string, previousMessages?: any[]) => Promise<ToolResult>;
  };
  workoutModification: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    modifyWorkout: (params: { userId: string; workoutDate: Date; changeRequest: string }) => Promise<any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    modifyWeek: (params: { userId: string; changeRequest: string; weekStartDate?: Date }) => Promise<any>;
  };
  planModification: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    modifyPlan: (params: { userId: string; changeRequest: string }) => Promise<any>;
  };
  training: {
    getOrGenerateWorkout: (userId: string, timezone: string) => Promise<ToolResult>;
  };
  queueMessage: (user: UserWithProfile, content: { content: string }, queueName: string) => Promise<{ messageId: string; queueEntryId: string }>;
}
