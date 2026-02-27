/**
 * Mock ToolServiceContainer for testing tool-using agents without side effects.
 *
 * Records all tool calls and returns predefined or generic stub responses,
 * never touching the database.
 */
import type { ToolMockResponse } from './types';

// ---------------------------------------------------------------------------
// Local interface mirroring ToolServiceContainer from the shared package.
// Defined here to avoid import issues in the scripts context.
// ---------------------------------------------------------------------------

interface ToolResult {
  response: string;
  messages?: string[];
}

interface ToolServiceContainer {
  profile: {
    updateProfile: (userId: string, message: string, previousMessages?: unknown[]) => Promise<ToolResult>;
  };
  workoutModification: {
    modifyWorkout: (params: { userId: string; workoutDate: Date; changeRequest: string }) => Promise<unknown>;
    modifyWeek: (params: { userId: string; changeRequest: string; weekStartDate?: Date }) => Promise<unknown>;
  };
  planModification: {
    modifyPlan: (params: { userId: string; changeRequest: string }) => Promise<unknown>;
  };
  training: {
    getOrGenerateWorkout: (userId: string, timezone: string) => Promise<ToolResult>;
  };
  queueMessage: (user: unknown, content: { content: string }, queueName: string) => Promise<{ messageId: string; queueEntryId: string }>;
}

// ---------------------------------------------------------------------------
// Recorded call type
// ---------------------------------------------------------------------------

/** A single recorded tool invocation */
export interface RecordedToolCall {
  toolName: string;
  method: string;
  args: unknown[];
  timestamp: string;
}

/** Pre-configured responses for mock tools, keyed by tool name */
export type MockToolResponses = Record<string, ToolMockResponse>;

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Creates a mock ToolServiceContainer that:
 * 1. Records all tool calls for later assertion / inspection
 * 2. Returns predefined responses from fixture data when available
 * 3. Returns generic stub responses otherwise
 * 4. Never touches the database
 */
export function createMockToolServices(toolResponses?: MockToolResponses) {
  const recordedCalls: RecordedToolCall[] = [];

  function record(toolName: string, method: string, args: unknown[]) {
    recordedCalls.push({
      toolName,
      method,
      args,
      timestamp: new Date().toISOString(),
    });
  }

  function getResponse(toolName: string): ToolResult {
    if (toolResponses?.[toolName]) {
      return toolResponses[toolName];
    }
    return { response: `[mock] ${toolName} executed successfully`, messages: [] };
  }

  const services: ToolServiceContainer = {
    profile: {
      updateProfile: async (userId, message, previousMessages) => {
        record('update_profile', 'updateProfile', [userId, message, previousMessages]);
        return getResponse('update_profile');
      },
    },
    workoutModification: {
      modifyWorkout: async (params) => {
        record('modify_workout', 'modifyWorkout', [params]);
        return getResponse('modify_workout');
      },
      modifyWeek: async (params) => {
        record('modify_week', 'modifyWeek', [params]);
        return getResponse('modify_week');
      },
    },
    planModification: {
      modifyPlan: async (params) => {
        record('modify_plan', 'modifyPlan', [params]);
        return getResponse('modify_plan');
      },
    },
    training: {
      getOrGenerateWorkout: async (userId, timezone) => {
        record('get_workout', 'getOrGenerateWorkout', [userId, timezone]);
        return getResponse('get_workout');
      },
    },
    queueMessage: async (user, content, queueName) => {
      record('queue_message', 'queueMessage', [user, content, queueName]);
      return { messageId: 'mock-msg-id', queueEntryId: 'mock-queue-id' };
    },
  };

  return {
    services,
    /** Get a copy of all recorded tool calls */
    getRecordedCalls: () => [...recordedCalls],
    /** Clear recorded calls */
    reset: () => {
      recordedCalls.length = 0;
    },
  };
}
