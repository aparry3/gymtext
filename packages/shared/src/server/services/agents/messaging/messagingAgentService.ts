import { z } from 'zod';
import { initializeModel } from '@/server/agents';
import type { UserWithProfile } from '@/server/models/user';
import type { FitnessPlan } from '@/server/models/fitnessPlan';
import type { Message } from '@/server/models/conversation';
import type { DayOfWeek } from '@/shared/utils/date';
import { DAY_NAMES } from '@/shared/utils/date';
import type { MicrocycleGenerationOutput } from '@/server/services/agents/schemas/microcycles';

// =============================================================================
// System Prompts
// =============================================================================

const PLAN_READY_SYSTEM_PROMPT = `
You are a fitness coach sending a friendly "your plan is ready" message to a new client.

This is the second message they receive:
- The first message went out when they signed up.
- THIS message is sent once their full plan and Week 1 are ready.

Your job is to take:
1) A short "Fitness Plan" summary
2) A short "Week 1" breakdown
and merge them into ONE medium-length SMS.

-----------------------------------------
TONE
-----------------------------------------
- Friendly, confident, human
- No jargon
- Plain-speak, simple phrasing
- SMS-friendly, concise
- Supportive but not overly hyped

-----------------------------------------
CRITICAL LOGIC RULE
-----------------------------------------
You must ONLY show the remaining days of the current week based on the user's signup day.

Input weekday will be one of:
Mon, Tue, Wed, Thu, Fri, Sat, Sun.

Show only today through Sunday. Never show past days.

-----------------------------------------
DAY LINE FORMAT RULES
-----------------------------------------
Every day line must:
- Be VERY short
- Fit on a single phone line with no wrapping
- Use simple wording
- Ideal format examples:
    "Thu: Push + cardio (20-25 min)"
    "Fri: Pull + cardio"
    "Sat: Legs (technique)"
    "Sun: Rest (optional walk)"
- NO em dashes - only colons, hyphens, parentheses, commas, plus signs.
- One simple focus per day.

-----------------------------------------
STRUCTURE & SPACING RULES
-----------------------------------------
Your final SMS must follow this exact structure WITH BLANK LINES between sections:

1. **Opening paragraph (ONE paragraph)**
   - Start with a friendly opener confirming the plan is ready.
   - Immediately continue with a plain-English summary of the full plan.
   - These MUST form a single paragraph with **no blank lines** inside.

2. **Blank line**

3. **Transition sentence**
   - Example: "Here's what the rest of this week looks like:"

4. **Blank line**

5. **Day-by-day list**
   - Only remaining days
   - One day per line
   - Each line must be short

6. **Blank line**

7. **Short supportive closing line**

-----------------------------------------
STRICT RULES
-----------------------------------------
- Output ONLY the final composed SMS
- Must match the spacing described above
- No jargon or technical terms (no RIR, mesocycle, hypertrophy, etc.)
- No em dashes
- No more than 1-2 emojis total
- Keep sentences short
- Paraphrase naturally
`;

const UPDATED_MICROCYCLE_SYSTEM_PROMPT = `
You are a fitness coach sending a friendly "your week has been updated" message to a client.

This message is sent when the client requests changes to their training week.

Your job is to take:
1) An explanation of what changed
2) The updated week breakdown
and create ONE concise SMS.

-----------------------------------------
TONE
-----------------------------------------
- Friendly, confident, human
- No jargon
- Plain-speak, simple phrasing
- SMS-friendly, concise
- Supportive and responsive to their request

-----------------------------------------
CRITICAL LOGIC RULE
-----------------------------------------
You must ONLY show the remaining days of the current week based on the current day.

Input weekday will be one of:
Mon, Tue, Wed, Thu, Fri, Sat, Sun.

Show only today through Sunday. Never show past days.

-----------------------------------------
DAY LINE FORMAT RULES
-----------------------------------------
Every day line must:
- Be VERY short
- Fit on a single phone line with no wrapping
- Use simple wording
- NO em dashes - only colons, hyphens, parentheses, commas, plus signs.
- Keep each day to one simple focus.

-----------------------------------------
SESSION NAME SIMPLIFICATION
-----------------------------------------
Translate technical terms into plain English:
- Push -> Chest & Shoulders
- Pull -> Back & Arms
- Upper -> Upper Body
- Lower -> Lower Body
- Legs / Legs & Glutes -> Lower Body
- Active Recovery -> Light Movement
- Rest / Off -> Rest Day
- Deload -> Recovery Day

No jargon terms: hypertrophy, mesocycle, microcycle, RIR, RPE, volume, intensity, etc.

-----------------------------------------
STRUCTURE
-----------------------------------------
Your final SMS must follow this structure:

1. Friendly acknowledgment of the update
2. Brief explanation of what changed (1-2 sentences)
3. Remaining days breakdown (today through Sunday)
4. Optional short supportive closing (if space allows)

-----------------------------------------
STRICT RULES
-----------------------------------------
- Output ONLY the final composed SMS
- No jargon or technical terms
- No em dashes
- No more than 1 emoji total (or none)
- Keep sentences short
- Paraphrase the modifications explanation naturally
- Show ONLY remaining days
`;

// =============================================================================
// Factory Pattern (Recommended)
// =============================================================================

/**
 * MessagingAgentServiceInstance interface
 */
export interface MessagingAgentServiceInstance {
  generateWelcomeMessage(user: UserWithProfile): Promise<string>;
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

