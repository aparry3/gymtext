import { UserWithProfile } from "@/server/models/userModel";

// System prompt for converting long-form plan to structured JSON
export const STRUCTURED_FITNESS_PLAN_SYSTEM_PROMPT = `
You are converting a long-form fitness plan into a structured JSON format.

<Task>
Convert the long-form plan provided by the user into a structured JSON object with the following schema:
{
  "programType": one of ["endurance", "strength", "shred", "hybrid", "rehab", "other"],
  "lengthWeeks": total number of weeks,
  "mesocycles": array of comprehensive mesocycle objects (see below),
  "overview": short motivational summary (120 words max),
  "notes": special considerations (injuries, travel, equipment),
  "reasoning": detailed explanation of design decisions (optional)
}

Each mesocycle object must include:
{
  "name": string (e.g., "Accumulation", "Intensification"),
  "objective": string (main objective for this phase),
  "focus": array of strings (e.g., ["hypertrophy", "volume tolerance"]),
  "durationWeeks": number (duration of this mesocycle),
  "startWeek": number (starting week number relative to full plan, 1-based),
  "endWeek": number (ending week number relative to full plan, 1-based),
  "volumeTrend": one of ["increasing", "stable", "decreasing"],
  "intensityTrend": one of ["increasing", "stable", "taper"],
  "conditioningFocus": string (optional, e.g., "Zone 2 cardio 2x/week"),
  "weeklyVolumeTargets": object mapping muscle groups to sets (e.g., {"chest": 14, "back": 16, "quads": 12}),
  "avgRIRRange": optional array of two numbers (e.g., [1, 2] for 1-2 RIR),
  "keyThemes": optional array of strings,
  "longFormDescription": string (full natural-language explanation of this mesocycle),
  "microcycles": array of strings (one per week, each describing that week's training in natural language)
}
</Task>

<Guidelines>
- Extract mesocycles directly from the long-form plan
- Calculate lengthWeeks as sum of all mesocycle durationWeeks
- For each mesocycle:
  - Extract or infer all required fields from the long-form description
  - Calculate startWeek and endWeek based on mesocycle sequence (1-based indexing)
  - Provide weeklyVolumeTargets for major muscle groups
  - Create a longFormDescription summarizing the mesocycle's purpose and progression
  - Break down each week within the mesocycle into microcycle descriptions (one string per week)
- Create an upbeat, encouraging overview (<=120 words) personalized for the user
- Include any special considerations (injuries, equipment, travel) in notes
- Ensure focus areas and trends match the plan description
- Each microcycle string should describe:
  - Week's focus and progression within the mesocycle
  - Intensity targets (RIR or %1RM)
  - Volume guidance
  - Conditioning if applicable
  - Any special notes (deload, technique focus, etc.)

Output only the JSON object - no additional text.
`;

// User prompt with plan description and context
export const structuredFitnessPlanUserPrompt = (
  planDescription: string,
  user: UserWithProfile,
  fitnessProfile: string
) => `
Convert the following long-form fitness plan into the structured JSON format.

<Long-Form Plan>
${planDescription}
</Long-Form Plan>

<User Context>
Name: ${user.name}
Fitness Profile: ${fitnessProfile}
</User Context>

<Instructions>
- Create an upbeat, encouraging overview (<=120 words) for ${user.name}
- Ensure all mesocycles and microcycles are extracted from the plan above
- Output only the JSON object - no additional text
</Instructions>
`.trim();
