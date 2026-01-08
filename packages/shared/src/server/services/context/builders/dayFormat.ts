/**
 * Day Format Context Builder
 *
 * Provides formatting rules for different day types (TRAINING, ACTIVE_RECOVERY, REST).
 * Format templates are stored in the prompts table and fetched dynamically.
 */

import type { PromptServiceInstance } from '@/server/services/domain/prompts/promptService';

// Lazy-loaded prompt service instance
let _promptService: PromptServiceInstance | null = null;

async function getPromptService(): Promise<PromptServiceInstance> {
  if (!_promptService) {
    const { createServicesFromDb } = await import('@/server/services/factory');
    const { postgresDb } = await import('@/server/connections/postgres/postgres');
    const services = createServicesFromDb(postgresDb);
    _promptService = services.prompt;
  }
  return _promptService;
}

export type DayActivityType = 'TRAINING' | 'ACTIVE_RECOVERY' | 'REST';

// Map activity types to prompt IDs
const ACTIVITY_TYPE_PROMPT_MAP: Record<DayActivityType, string> = {
  TRAINING: 'workout:message:format:training',
  ACTIVE_RECOVERY: 'workout:message:format:active_recovery',
  REST: 'workout:message:format:rest',
};

/**
 * Fetch day format prompt from database
 *
 * @param activityType - The type of day (TRAINING, ACTIVE_RECOVERY, REST)
 * @returns The format template string or null if not found
 */
export const fetchDayFormat = async (
  activityType: DayActivityType | null | undefined
): Promise<string | null> => {
  if (!activityType) {
    return null;
  }

  const promptId = ACTIVITY_TYPE_PROMPT_MAP[activityType];
  if (!promptId) {
    return null;
  }

  try {
    const promptService = await getPromptService();
    return await promptService.getContextPrompt(promptId);
  } catch (error) {
    console.warn(`[dayFormat] Could not fetch format for ${activityType}:`, error);
    return null;
  }
};

/**
 * Build day format context string
 *
 * @param formatTemplate - The pre-fetched format template
 * @param activityType - The type of day (for labeling)
 * @returns Formatted context string with XML tags
 */
export const buildDayFormatContext = (
  formatTemplate: string | null | undefined,
  activityType: DayActivityType | null | undefined
): string => {
  if (!formatTemplate || !activityType) {
    return '';
  }

  return `<DayFormatRules type="${activityType}">
${formatTemplate.trim()}
</DayFormatRules>`;
};
