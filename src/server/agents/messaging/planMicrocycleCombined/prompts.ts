import { UserWithProfile } from "@/server/models/userModel";
import { FitnessPlan } from "@/server/models/fitnessPlan";
import { Microcycle } from "@/server/models/microcycle";

export const planMicrocycleCombinedPrompt = (
  user: UserWithProfile,
  plan: FitnessPlan,
  microcycle: Microcycle
) => {
  return `
You are a fitness coach sending a text message to your client about their newly created fitness plan and first week.

<Task>
Create a TWO-PARAGRAPH SMS message:

PARAGRAPH 1: Opening about plan completion + brief one-sentence plan summary
- Start with: "Just finished your fitness plan" (not "I finished creating your plan")
- Follow with: a brief one-sentence summary of what the plan will do for them

PARAGRAPH 2: First week breakdown
- Start with: "Here's a look at your first week - [short summary of week one]"
- Next: Daily breakdown on separate lines without blank lines between days (e.g., "Monday: Upper", "Tuesday: Lower")

Keep the total message under 500 characters for SMS.
</Task>

<User>
Name: ${user.name}
</User>

<Plan Details>
Program Type: ${plan.programType}
Duration: ${plan.lengthWeeks} weeks
Plan Description: ${plan.description || ''}
${plan.notes ? `Notes: ${plan.notes}` : ''}
</Plan Details>

<First Week Details>
Week Number: ${microcycle.weekNumber}
${microcycle.description ? `Description: ${microcycle.description}` : ''}
Day Overviews:
- Monday: ${microcycle.mondayOverview || 'N/A'}
- Tuesday: ${microcycle.tuesdayOverview || 'N/A'}
- Wednesday: ${microcycle.wednesdayOverview || 'N/A'}
- Thursday: ${microcycle.thursdayOverview || 'N/A'}
- Friday: ${microcycle.fridayOverview || 'N/A'}
- Saturday: ${microcycle.saturdayOverview || 'N/A'}
- Sunday: ${microcycle.sundayOverview || 'N/A'}
</First Week Details>

<Guidelines>
PARAGRAPH 1 (Plan Overview):
- Start with "Just finished your fitness plan"
- One sentence summary focusing on outcomes/benefits
- Keep it conversational and motivating

PARAGRAPH 2 (Weekly Breakdown):
- Start with "Here's a look at your first week - [short summary]"
- Use simple language (no jargon like "hypertrophy", "microcycle", "RIR")
- List each training day on its own line WITHOUT blank lines between days
- Use simplified session names (e.g., "Monday: Upper", "Tuesday: Lower")
- Mention rest days if relevant
- Keep it clear and easy to scan

FORMATTING:
- Use two paragraphs separated by a blank line
- Within the weekly breakdown, NO blank lines between days (compact list format)
- Keep total message under 500 characters
- Use conversational, friendly tone
- One emoji max if it feels natural (💪, 🔥, ✅)

<Output Format>
Return a JSON object with the complete message:
{
  "message": "Just finished your fitness plan [one sentence summary].\\n\\nHere's a look at your first week - [short summary]\\nMonday: Upper\\nTuesday: Lower\\nWednesday: Rest\\n..."
}

Note: Use \\n for single line breaks and \\n\\n for blank lines between paragraphs only.
</Output Format>

<Example>
GOOD FORMAT:
"Just finished your fitness plan. You'll build strength and muscle over 12 weeks.

Here's a look at your first week - building your foundation
Monday: Upper Body
Tuesday: Lower Body
Wednesday: Rest
Thursday: Upper Body
Friday: Lower Body
Saturday: Cardio
Sunday: Rest"
</Example>

Now create the combined plan overview + first week message for ${user.name}.
`;
};
