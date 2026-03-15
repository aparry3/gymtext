/**
 * User Context Migration
 *
 * Migrates existing gymtext user data (profile, plan, microcycle)
 * into agent-runner's context store as a single fitness context.
 */
import type { Runner } from '@agent-runner/core';
import type { MarkdownServiceInstance } from '@/server/services/domain/markdown/markdownService';
import { fitnessContextId, chatSessionId, appendMessageToSession } from '../helpers';

export interface MigrationResult {
  userId: string;
  success: boolean;
  hasProfile: boolean;
  hasPlan: boolean;
  hasWeek: boolean;
  error?: string;
}

/**
 * Migrate a single user's fitness data to agent-runner context store.
 */
export async function migrateUserContext(
  runner: Runner,
  markdown: MarkdownServiceInstance,
  userId: string
): Promise<MigrationResult> {
  const result: MigrationResult = {
    userId,
    success: false,
    hasProfile: false,
    hasPlan: false,
    hasWeek: false,
  };

  try {
    const [profileContent, plan, week] = await Promise.all([
      markdown.getProfile(userId),
      markdown.getPlan(userId),
      markdown.getWeek(userId),
    ]);

    result.hasProfile = !!profileContent;
    result.hasPlan = !!plan?.content;
    result.hasWeek = !!week?.content;

    if (!profileContent && !plan?.content) {
      result.error = 'No profile or plan data to migrate';
      return result;
    }

    const contextParts: string[] = [];
    if (profileContent) contextParts.push(`## Profile\n${profileContent}`);
    if (plan?.content) contextParts.push(`## Training Plan\n${plan.content}`);
    if (week?.content) contextParts.push(`## Weekly Schedule\n${week.content}`);
    contextParts.push(`## Recent History\n(Migrated from legacy system)`);
    contextParts.push(`## Preferences & Notes\n(To be populated as user interacts)`);

    const contextContent = contextParts.join('\n\n');
    const contextId = fitnessContextId(userId);

    await runner.context.add(contextId, {
      agentId: 'migration',
      invocationId: `migrate-${userId}-${Date.now()}`,
      content: contextContent,
      createdAt: new Date().toISOString(),
    });

    result.success = true;
    return result;
  } catch (error) {
    result.error = error instanceof Error ? error.message : String(error);
    return result;
  }
}

/**
 * Migrate a user's recent chat history into an agent-runner session.
 */
export async function migrateChatHistory(
  runner: Runner,
  recentMessages: Array<{ content: string; direction: string; createdAt: string }>,
  userId: string
): Promise<{ success: boolean; messageCount: number }> {
  if (!recentMessages.length) return { success: true, messageCount: 0 };

  try {
    const sessionId = chatSessionId(userId);
    const recent = recentMessages.slice(-20);

    for (const msg of recent) {
      const role: 'user' | 'assistant' = msg.direction === 'inbound' ? 'user' : 'assistant';
      await appendMessageToSession(runner, sessionId, { role, content: msg.content });
    }

    return { success: true, messageCount: recent.length };
  } catch (error) {
    console.error(`[Migration] Chat history failed for user ${userId}:`, error);
    return { success: false, messageCount: 0 };
  }
}

/**
 * Batch migrate multiple users.
 */
export async function migrateUsers(
  runner: Runner,
  markdown: MarkdownServiceInstance,
  userIds: string[],
  options?: {
    batchSize?: number;
    onProgress?: (completed: number, total: number, result: MigrationResult) => void;
  }
): Promise<MigrationResult[]> {
  const results: MigrationResult[] = [];
  const batchSize = options?.batchSize ?? 5;

  console.log(`[Migration] Starting migration for ${userIds.length} users`);

  for (let i = 0; i < userIds.length; i += batchSize) {
    const batch = userIds.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(uid => migrateUserContext(runner, markdown, uid))
    );

    for (const r of batchResults) {
      results.push(r);
      options?.onProgress?.(results.length, userIds.length, r);
    }
  }

  const succeeded = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  console.log(`[Migration] Complete: ${succeeded} succeeded, ${failed} failed`);

  return results;
}
