/**
 * Chat Tool Registrations
 *
 * Registers the chat-related tools in the ToolRegistry.
 * These tools are used by the chat:generate agent for conversation handling.
 *
 * Tool priority determines execution order when multiple tools are called:
 *   1. update_profile - Record user preferences first
 *   2. get_workout - Query based on updated state
 *   3. make_modification - Modify based on current state
 *
 * Tool implementations receive a ToolContext with:
 *   - userId, message, previousMessages, timezone
 *   - onSendMessage callback (for immediate messages)
 *   - Service callbacks injected via context (see ChatToolDeps)
 *
 * Usage:
 *   Call registerChatTools(deps) once at service initialization.
 *   Then agents can reference tools by name: ['update_profile', 'get_workout', 'make_modification']
 */
import { z } from 'zod';
import { toolRegistry, type ToolContext } from '../toolRegistry';
import type { ToolExecutionResult } from '../../types';

/**
 * Dependencies that chat tools need at execution time.
 * These are injected into the ToolContext when creating tools.
 */
export interface ChatToolDeps {
  makeModification: (userId: string, message: string, previousMessages?: unknown[]) => Promise<ToolExecutionResult>;
  getWorkout: (userId: string, timezone: string) => Promise<ToolExecutionResult>;
  updateProfile: (userId: string, message: string, previousMessages?: unknown[]) => Promise<ToolExecutionResult>;
}

/**
 * Extended tool context for chat tools.
 * Includes the ChatToolDeps as named properties.
 */
export interface ChatToolContext extends ToolContext {
  deps: ChatToolDeps;
}

/**
 * Register all chat tools in the ToolRegistry.
 *
 * This should be called once during application initialization.
 * Tools can then be resolved by name via toolRegistry.createTools().
 */
export function registerChatTools(): void {
  // Skip if already registered
  if (toolRegistry.has('update_profile')) return;

  toolRegistry.register({
    name: 'update_profile',
    description: `Record permanent user preferences and profile information.

Use this tool when the user shares PERMANENT information:
- **Preferences**: "I like starting with legs", "I prefer barbells", "I hate lunges"
- **Constraints/Injuries**: "I hurt my knee", "I have a bad shoulder"
- **Schedule preferences**: "I prefer runs on Tuesdays", "I like morning workouts"
- **Goals**: "I want to lose 10lbs", "training for a marathon"
- **Equipment/Location**: "I go to Planet Fitness", "I have a home gym"
- **Settings**: timezone, send time, or name changes

DO NOT use for one-time requests ("switch today to legs") or questions.

IMPORTANT: If user wants BOTH a preference AND a workout change, call BOTH tools.
Example: "Add runs to my plan on Tues/Thurs" -> update_profile (preference) + make_modification (plan change)

All context is automatically provided - no parameters needed.`,
    schema: z.object({}),
    priority: 1,
    toolType: 'action',
    execute: async (_args: Record<string, unknown>, context: ToolContext): Promise<ToolExecutionResult> => {
      const deps = (context as ChatToolContext).deps;
      return deps.updateProfile(context.userId, context.message, context.previousMessages);
    },
  });

  toolRegistry.register({
    name: 'get_workout',
    description: `Get the user's workout for today.

Use this tool when the user asks about their workout for today, such as:
- "What's my workout today?"
- "What am I doing today?"
- "Send me my workout"
- "What exercises do I have?"

This tool will:
1. Check if a workout already exists for today
2. If not, generate one based on their fitness plan
3. Return the full workout details and send the workout message

IMPORTANT: Only use this for TODAY's workout. Do not use for future dates.
If [CONTEXT: WORKOUT] says "No workout scheduled", use this tool to generate it.
All context is automatically provided - no parameters needed.`,
    schema: z.object({}),
    priority: 2,
    toolType: 'query',
    execute: async (_args: Record<string, unknown>, context: ToolContext): Promise<ToolExecutionResult> => {
      const deps = (context as ChatToolContext).deps;
      return deps.getWorkout(context.userId, context.timezone);
    },
  });

  toolRegistry.register({
    name: 'make_modification',
    description: `Make changes to the user's workout or training program.

Use this tool for:
- **Today's Workout**: Swap exercises, different constraints, different equipment
- **Weekly Schedule**: Change workout type, muscle group, or training day
- **Program-Level**: Frequency, training splits, overall focus

This tool handles WORKOUT CONTENT - not user settings like send time, timezone, or name.
All context (user, message, date, etc.) is automatically provided - no parameters needed.`,
    schema: z.object({}),
    priority: 3,
    toolType: 'action',
    immediateMessage: true,
    execute: async (_args: Record<string, unknown>, context: ToolContext): Promise<ToolExecutionResult> => {
      const deps = (context as ChatToolContext).deps;
      return deps.makeModification(context.userId, context.message, context.previousMessages);
    },
  });
}
