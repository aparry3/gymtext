/**
 * Plans Prompts - Template functions for fitness plan generation and modification
 *
 * NOTE: System prompt string constants have been removed.
 * Runtime prompts are fetched from the database via PROMPT_IDS.
 * Zod schemas are in schemas/plans.ts, types are in types/plans.ts.
 */

import type { PlanMessageData } from '../types/plans';

// =============================================================================
// Message Template Functions
// =============================================================================

export const planSummaryMessageUserPrompt = (data: PlanMessageData) => {
  return `
Generate a short, friendly onboarding SMS for the client below based on their new fitness plan.

<User>
Name: ${data.userName}
</User>

<User Profile>
${data.userProfile || 'No profile information available'}
</User Profile>

<Fitness Plan>
${data.overview}
</Fitness Plan>

Guidelines:
- This message is sent right after the trainer finishes creating the plan.
- It should sound natural and personal, as if the coach is texting the client directly.
- Focus on what the plan does and how it's structured (e.g., building from base to strength, using 4-day split, etc.).
- Translate complex language into clear, human terms.
- Limit to 1 or 2 messages total (each under 160 characters).
- Do not greet or include the client's name.
- Use first-person tone.
- Avoid em dashes and long sentences.
- Output only the message text (no JSON wrapper).
`.trim();
};

// =============================================================================
// Structured Template Functions
// =============================================================================

export const structuredPlanUserPrompt = (planDescription: string): string => `Parse the following fitness plan into structured format:

${planDescription}`;
