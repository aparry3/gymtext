/**
 * Profile Prompts - All prompts related to profile agents
 *
 * NOTE: System prompt string constants have been removed.
 * Runtime prompts are fetched from the database via agent definitions.
 * Only template functions are kept here.
 */

import type { UserWithProfile } from '@/server/models/user';

// =============================================================================
// Profile Update Agent Template Functions
// =============================================================================

export function buildProfileUpdateUserMessage(
  currentProfile: string,
  message: string,
  user: UserWithProfile,
  currentDate: string
): string {
  return `## CONTEXT

**Current Date**: ${currentDate}
**User Timezone**: ${user.timezone}
**User Name**: ${user.name}
**User Age**: ${user.age || 'Unknown'}
**User Gender**: ${user.gender || 'Unknown'}

---

## CURRENT PROFILE

${currentProfile || '_No profile exists yet. Create initial profile based on the message._'}

---

## USER'S MESSAGE

${message}

---

## YOUR TASK

1. Review the current profile.
2. **FIRST: Determine if this message contains PERMANENT profile information.**
   - If it's only a transient request (like "switch today to X", "can I do Y instead"), return wasUpdated: false.
   - Look for keywords: "today", "this time", "can we", "let's" = TRANSIENT (don't record)
   - Look for keywords: "I like", "I prefer", "I always", "from now on" = PERMANENT (do record)
3. Check for [ACTIVE] constraints that have expired and remove them.
4. Extract any PERMANENT preferences (scheduling, exercise, workout style).
5. Update EQUIPMENT details if the user mentions gym type, specific equipment, or limitations.
6. Update other sections based on the message. **Carefully distinguish between "Fixed Anchors" (Classes/Sports) and "Current Habits" (General routine).**
7. Return the COMPLETE updated profile (or unchanged if wasUpdated: false).
`;
}

// =============================================================================
// User Fields Agent Template Functions
// =============================================================================

/**
 * Build the user message for the User Fields Agent
 *
 * Provides context about the user's current settings and the message to analyze.
 */
export function buildUserFieldsUserMessage(
  message: string,
  user: UserWithProfile,
  currentDate: string
): string {
  return `## CURRENT USER SETTINGS
- Name: ${user.name || 'Not set'}
- Timezone: ${user.timezone}
- Preferred Send Hour: ${user.preferredSendHour} (${formatHourForDisplay(user.preferredSendHour)})
- Current Date: ${currentDate}

## USER MESSAGE
${message}

## TASK
Analyze the message above. Extract any requested changes to timezone, send time, or name.
Return null for fields not being changed.`;
}

/**
 * Format hour for display (e.g., 8 → "8:00 AM", 18 → "6:00 PM")
 */
function formatHourForDisplay(hour: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:00 ${period}`;
}

// =============================================================================
// Structured Profile Agent Template Functions
// =============================================================================

/**
 * Build the user message for the Structured Profile Agent
 */
export function buildStructuredProfileUserMessage(
  dossierText: string,
  currentDate: string
): string {
  return `## CURRENT DATE
${currentDate}

## PROFILE TO PARSE

${dossierText || '_No profile content - return empty arrays for all fields_'}

## YOUR TASK
Parse this profile into the structured format. Extract all relevant information following the rules above.`;
}
