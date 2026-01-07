import { z } from 'zod';
import { initializeModel } from '@/server/agents';
import type { UserWithProfile } from '@/server/models/user';
import type { FitnessPlan } from '@/server/models/fitnessPlan';
import type { Message } from '@/server/models/conversation';
import type { DayOfWeek } from '@/shared/utils/date';
import { DAY_NAMES } from '@/shared/utils/date';
import type { MicrocycleGenerationOutput } from '@/server/services/agents/prompts/microcycles';

// =============================================================================
// Factory Pattern (Recommended)
// =============================================================================

/**
 * MessagingAgentServiceInstance interface
 */
export interface MessagingAgentServiceInstance {
  generateWelcomeMessage(user: UserWithProfile): Promise<string>;
  generateWeeklyMessage(user: UserWithProfile, isDeload: boolean, absoluteWeek: number): Promise<string>;
  generatePlanSummary(user: UserWithProfile, plan: FitnessPlan, previousMessages?: Message[]): Promise<string[]>;
  generatePlanMicrocycleCombinedMessage(fitnessPlan: string, weekOne: string, currentWeekday: DayOfWeek): Promise<string>;
  generateUpdatedMicrocycleMessage(modifiedMicrocycle: MicrocycleGenerationOutput, modifications: string, currentWeekday: DayOfWeek): Promise<string>;
}

/**
 * Create a MessagingAgentService instance
 * No dependencies needed - uses initializeModel internally
 */
export function createMessagingAgentService(): MessagingAgentServiceInstance {
  // Reuse schemas and prompts from below
  const WeeklyMessageSchema = z.object({
    feedbackMessage: z.string().describe("Message asking for feedback on the past week")
  });

  const PlanSummarySchema = z.object({
    messages: z.array(z.string()).describe("Array of SMS messages (each under 160 chars)")
  });

  return {
    async generateWelcomeMessage(user: UserWithProfile): Promise<string> {
      const firstName = user.name?.split(' ')[0] || 'there';
      return `Hey ${firstName}!

After you hit "Sign Up," millions of documents were scanned—each with one goal: to build the best plan for your fitness journey.

Then came the planning stage—millions of AI bots mapping, testing, and re-testing until your plan was dialed in. Working to the studs to perfect the product.

Now, as your first workout sends, the bots cheer…then back to work…and we at the GymText family smile as another perfect plan leaves the factory.

Welcome to GymText.

Text me anytime with questions about your workouts, your plan, or if you just need a little extra help!`;
    },

    async generateWeeklyMessage(user: UserWithProfile, isDeload: boolean, absoluteWeek: number): Promise<string> {
      const model = initializeModel<{ feedbackMessage: string }>(WeeklyMessageSchema);
      const firstName = user.name.split(' ')[0];

      const userPrompt = `Generate a weekly feedback check-in message for the user.

User Information:
- Name: ${user.name}
- First Name: ${firstName}
- Week: ${absoluteWeek} of their program

${isDeload ? `IMPORTANT: Next week is a DELOAD week - a planned recovery week with reduced intensity.
Acknowledge this positively and remind them that recovery is part of the training process.` : 'This is a regular training week.'}

Generate the feedback message now.`;

      console.log(`[MessagingAgentService] Weekly message user prompt: ${userPrompt}`);

      const prompt = [
        { role: 'system' as const, content: WEEKLY_MESSAGE_SYSTEM_PROMPT },
        { role: 'user' as const, content: userPrompt }
      ];

      const result = await model.invoke(prompt);
      return result.feedbackMessage;
    },

    async generatePlanSummary(user: UserWithProfile, plan: FitnessPlan, previousMessages?: Message[]): Promise<string[]> {
      const model = initializeModel<{ messages: string[] }>(PlanSummarySchema);
      const hasContext = previousMessages && previousMessages.length > 0;
      const contextSection = hasContext
        ? `
<Previous Messages>
${previousMessages?.map(msg => `${msg.direction === 'inbound' ? 'User' : 'Coach'}: ${msg.content}`).join('\n\n')}
</Previous Messages>

IMPORTANT: You are continuing a conversation that has already started. DO NOT greet the user by name again. DO NOT introduce yourself again. Just continue naturally with the plan summary.
`
        : '';

      const prompt = `
You are a motivational fitness coach sending an exciting SMS message about a new fitness plan.

${contextSection}

<Task>
Create 2-3 SMS messages (each under 160 characters) that summarize this fitness plan in an exciting, motivational way.
</Task>

<User>
Name: ${user.name}
</User>

<Plan Details>
${plan.description || 'No plan description available.'}
</Plan Details>

<Guidelines>
- Keep each message under 160 characters (SMS limit)
- Be enthusiastic and motivational
- Focus on what the plan will do for them (outcomes, not just structure)
- Mention the training split and key focuses from the plan
- Make them excited to start
- Use conversational, friendly tone
- Don't use emojis unless they help save characters
- Number the messages if multiple (e.g., "1/3:", "2/3:")

<Output Format>
Return a JSON object with an array of messages:
{
  "messages": [
    "Message 1 text here...",
    "Message 2 text here...",
    "Message 3 text here (if needed)..."
  ]
}
</Output Format>

Now create the motivational SMS messages for ${user.name}'s training program.
`;

      const result = await model.invoke(prompt);
      return result.messages;
    },

    async generatePlanMicrocycleCombinedMessage(fitnessPlan: string, weekOne: string, currentWeekday: DayOfWeek): Promise<string> {
      const model = initializeModel(undefined);
      const userPrompt = `
Create the "your plan is ready" SMS using the inputs below.
Follow the System Prompt exactly.

[FITNESS PLAN]
${fitnessPlan}

[WEEK 1]
${weekOne}

[TODAY]
${currentWeekday}

Output ONE medium-length SMS:
- Confirm the plan is ready
- Summarize the plan plainly
- Transition into the week
- Show ONLY the remaining days, each on one short line
- NO em dashes
- Supportive closing line
`.trim();

      const messages = [
        { role: 'system', content: PLAN_READY_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ];

      return model.invoke(messages);
    },

    async generateUpdatedMicrocycleMessage(modifiedMicrocycle: MicrocycleGenerationOutput, modifications: string, currentWeekday: DayOfWeek): Promise<string> {
      const model = initializeModel(undefined);
      const dayIndex = DAY_NAMES.indexOf(currentWeekday);
      const remainingDays = modifiedMicrocycle.days
        .slice(dayIndex)
        .map((dayOverview, idx) => {
          const actualDayName = DAY_NAMES[dayIndex + idx];
          return `${actualDayName}:\n${dayOverview}`;
        })
        .join('\n\n');

      const userPrompt = `
Create an "updated week" SMS using the inputs below.
Follow the System Prompt exactly.

[WHAT CHANGED]
${modifications}

[UPDATED WEEK OVERVIEW]
${modifiedMicrocycle.overview}

[IS DELOAD WEEK]
${modifiedMicrocycle.isDeload}

[REMAINING DAYS]
${remainingDays}

[TODAY]
${currentWeekday}

Output ONE concise SMS:
- Acknowledge the update
- Briefly explain what changed (paraphrase naturally)
- Show ONLY the remaining days, each on one short line
- NO em dashes
- Optional supportive closing
`.trim();

      const messages = [
        { role: 'system', content: UPDATED_MICROCYCLE_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ];

      return model.invoke(messages);
    },
  };
}

