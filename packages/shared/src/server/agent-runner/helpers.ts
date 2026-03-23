/**
 * GymText Agent Runner Helpers
 *
 * Convenience functions for common operations.
 */
import type { Runner, Message } from '@agent-runner/core';

/**
 * Generate the fitness context ID for a user.
 * Convention: users/<userId>/fitness
 */
export function fitnessContextId(userId: string): string {
  return `users/${userId}/fitness`;
}

/**
 * Generate the chat session ID for a user.
 * Convention: chat:<userId>
 */
export function chatSessionId(userId: string): string {
  return `chat:${userId}`;
}

/**
 * Append a message to a session without invoking an agent.
 *
 * Used to inject non-conversational messages into chat sessions
 * (e.g., daily workout messages so the chat agent knows what was sent).
 */
export async function appendMessageToSession(
  runner: Runner,
  sessionId: string,
  message: { role: 'user' | 'assistant' | 'system'; content: string }
): Promise<void> {
  await runner.sessions.append(sessionId, [
    {
      role: message.role,
      content: message.content,
      timestamp: new Date().toISOString(),
    } as Message,
  ]);
}
