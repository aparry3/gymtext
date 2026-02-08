/**
 * Modifications Prompts - Template functions for the modifications agent
 *
 * NOTE: System prompt string constants have been removed.
 * Runtime prompts are fetched from the database via PROMPT_IDS.
 * Types are in types/modifications.ts.
 */

import type { UserWithProfile } from '@/server/models/user';
import { formatForAI, getDayOfWeekName } from '@/shared/utils/date';

interface ModificationsUserMessageInput {
  user: UserWithProfile;
  message: string;
}

// =============================================================================
// Message Template Functions
// =============================================================================

/**
 * Build the dynamic user message with context
 *
 * Note: Conversation history is now passed as structured messages in the message array,
 * not concatenated into this prompt.
 */
export const buildModificationsUserMessage = (input: ModificationsUserMessageInput): string => {
  const { user } = input;

  // Get current date/time in user's timezone
  const now = new Date();
  const currentDate = formatForAI(now, user.timezone);

  // Get the current day of the week
  const currentDayOfWeek = getDayOfWeekName(now, user.timezone); // Full weekday name (e.g., "Monday")

  return `## CONTEXT

**Todays Date**: ${currentDate}
**Todays Day of Week**: ${currentDayOfWeek}
**User Name**: ${user.name}

### User Profile
${user.profile || 'No profile available'}

---

**Users Message**: ${input.message}

---

Select the appropriate tool based on the user's request. All parameters (userId, date, targetDay, etc.) are automatically provided from context.`;
};
