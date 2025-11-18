/**
 * Prompt for combining pre-generated plan and microcycle messages into onboarding message
 */
export const planMicrocycleCombinedPrompt = (
  planMessage: string,
  microcycleMessage: string
) => {
  return `
You are a fitness coach sending an onboarding text message to your client after creating their plan.

<Task>
Combine the two pre-written messages below into a single, cohesive onboarding message:

1. Plan message (already written and optimized for SMS)
2. Microcycle/weekly message (already written and optimized for SMS)

Create a TWO-PARAGRAPH message:

PARAGRAPH 1: Welcome + Plan Summary
- Start with: "Just finished putting your plan together"
- Then include the plan message content (which summarizes what the plan does)

PARAGRAPH 2: First Week Overview
- Start with: "Let's take a look at your first week"
- Then include the microcycle message content (which shows the weekly breakdown)

Keep the total message under 500 characters for SMS.
</Task>

<Plan Message>
${planMessage}
</Plan Message>

<Microcycle Message>
${microcycleMessage}
</Microcycle Message>

<Guidelines>
- Combine the messages naturally and conversationally
- Keep the welcoming tone from both original messages
- Maintain the structure: welcome intro + plan summary, then week intro + weekly breakdown
- No need to regenerate content - use what's already written in the messages
- Keep total message under 500 characters
- Use \\n\\n to separate the two paragraphs
- Maintain friendly, coach-like tone

<Output Format>
Return ONLY the complete message text (no JSON wrapper):

Just finished putting your plan together. [plan message content]

Let's take a look at your first week. [microcycle message content]

Note: Use \\n for single line breaks and \\n\\n for blank lines between paragraphs.
</Output Format>
`;
};
