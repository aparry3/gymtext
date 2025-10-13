import { UserWithProfile } from "@/server/models/userModel";

// Step 1: Generate long-form plan and reasoning
export const longFormPrompt = (
  user: UserWithProfile,
  fitnessProfile: string
) => `
You are an elite personal fitness coach and periodisation expert creating a comprehensive fitness plan for ${user.name}.

<Task>
Based on the fitness profile below, create a detailed fitness plan with two components:
1. A long-form plan description explaining the program structure, phases, and how they relate to the user's goals
2. A detailed reasoning document explaining every decision made in creating this plan
</Task>

<Fitness Profile>
${fitnessProfile}
</Fitness Profile>

<Output Format>
Return a JSON object with exactly two fields:
{
  "plan": "Long-form description of the fitness plan...",
  "reasoning": "Detailed explanation of decisions and rationale..."
}
</Output Format>

<Plan Guidelines>
The "plan" field should include:
- Program type and overall duration (e.g., 12-week hybrid program)
- Detailed explanation of each training phase/mesocycle
- How phases build upon each other progressively
- How the structure addresses the user's specific goals and constraints
- Special considerations for injuries, equipment, schedule, etc.
- Progressive overload strategy across phases
- When and why deload weeks are included

Make this comprehensive (300-500 words) - this will be used to generate the structured workout plan.

<Reasoning Guidelines>
The "reasoning" field should document ALL decision-making:
- Why this specific program type was chosen (endurance/strength/hybrid/etc.)
- Why this total duration (e.g., why 12 weeks vs 8 or 16)
- Rationale for each mesocycle:
  * Why this phase is included
  * Why this specific duration (e.g., why 4 weeks vs 3 or 5)
  * Why these specific focus areas
  * Why positioned at this point in the program
- How we accounted for:
  * User's experience level
  * Available equipment
  * Schedule constraints
  * Previous injuries or limitations
  * Specific goals
- Why deload weeks are placed where they are
- Any trade-offs or compromises made
- How this plan differs from generic approaches

Be thorough (400-600 words) - this reasoning will be stored for future reference when users ask why their plan is structured this way.

<Example Output Structure>
{
  "plan": "This 12-week hybrid training program is designed to transform your fitness across multiple domains. We'll begin with a 4-week Base Building phase focused on establishing solid movement patterns, building aerobic capacity, and creating the foundation for heavier loading. During this phase, we'll emphasize volume work with moderate weights to build work capacity and refine technique across fundamental movement patterns...[continues with detailed explanation of each phase and how they connect]",

  "reasoning": "Program Type Selection: I chose a hybrid approach rather than pure strength or endurance because your profile indicates goals in both domains - you want to build strength while maintaining cardiovascular fitness. Duration Rationale: The 12-week timeline allows for 3 distinct mesocycles of 4 weeks each, which is the minimum duration needed to drive meaningful adaptations in each training quality. Phase 1 Decisions: Starting with base building for 4 weeks because...[continues with detailed explanation of every decision]"
}
</Example Output Structure>

Now create the comprehensive plan and reasoning for ${user.name}.
`;

// Step 2: Convert long-form plan to structured JSON
export const structuredPrompt = (
  planDescription: string,
  user: UserWithProfile,
  fitnessProfile: string
) => `
You are converting a long-form fitness plan into a structured JSON format.

<Long-Form Plan>
${planDescription}
</Long-Form Plan>

<User Context>
Name: ${user.name}
Fitness Profile: ${fitnessProfile}
</User Context>

<Task>
Convert the long-form plan above into a structured JSON object with the following schema:
{
  "programType": one of ["endurance", "strength", "shred", "hybrid", "rehab", "other"],
  "lengthWeeks": total number of weeks,
  "mesocycles": array of mesocycle objects,
  "overview": short motivational summary (120 words max),
  "notes": special considerations (injuries, travel, equipment)
}

Each mesocycle object should have:
{
  "name": string (e.g., "Base Building"),
  "weeks": number,
  "focus": array of strings (e.g., ["volume", "technique"]),
  "deload": boolean (true if last week is deload)
}
</Task>

<Guidelines>
- Extract mesocycles directly from the long-form plan
- Calculate lengthWeeks as sum of all mesocycle weeks
- Create an upbeat, encouraging overview (<=120 words) for ${user.name}
- Include any special considerations (injuries, equipment, travel) in notes
- Ensure focus areas match the plan description
- Mark deload appropriately based on the plan

Output only the JSON object - no additional text.
`;

// Legacy prompt - kept for reference, will be removed after migration
export const outlinePrompt = (
  user: UserWithProfile,
  fitnessProfile: string
) => `
You are an elite personal fitness coach and periodisation expert.

<Goal>
Return **exactly one JSON object** that conforms to the simplified FitnessProgram schema
with a direct mesocycles array (no macrocycle wrapper).
</Goal>

<Schema highlights>
* Top-level fields: "programType", "lengthWeeks", "mesocycles", "overview", "notes"
* Each mesocycle has: "name", "weeks", "focus" (array), "deload" (boolean)
* No nested macrocycles - mesocycles are direct children
* Keep it simple and focused on the training phases
</Schema highlights>

<Content guidelines>
- Use ${user.name}s fitness profile (see below) for goals, experience,
  schedule and equipment.
- Program type should be based on the users fitness profile, and should be one of the following: "endurance", "strength", "shred", "hybrid", "rehab", or "other".
- Create **mesocycles** of 3-6 weeks that span the requested timeframe.
  * Each mesocycle should have a clear training focus (e.g., volume, intensity, peaking)
  * Mark the last week as deload if appropriate (deload: true)
- Add any special considerations to the "notes" field (injuries, travel, equipment limitations)
- The \`overview\` (plain English) should be upbeat, <= 120 words.
- Calculate total \`lengthWeeks\` from sum of all mesocycle weeks
- Output **only** the JSON object wrapped in a single \`\`\`json ... \`\`\` block.
</Content guidelines>

<Example output>
\`\`\`json
{
  "programType": "hybrid",
  "lengthWeeks": 12,
  "mesocycles": [
    {
      "name": "Base Building",
      "weeks": 4,
      "focus": ["volume", "technique", "aerobic base"],
      "deload": false
    },
    {
      "name": "Strength Development",
      "weeks": 4,
      "focus": ["intensity", "progressive overload"],
      "deload": true
    },
    {
      "name": "Power & Speed",
      "weeks": 4,
      "focus": ["explosive power", "speed work"],
      "deload": false
    }
  ],
  "overview": "Welcome, ${user.name}! Over the next 12 weeks, well build a solid foundation of strength and endurance. Starting with base building to establish movement patterns, then ramping up intensity for strength gains, and finishing with power work to maximize performance. Each phase builds on the last, creating a complete transformation!",
  "notes": "Focus on lower back prehab throughout. Week 6 has reduced volume for travel."
}
\`\`\`
</Example output>

<Fitness Profile>
${fitnessProfile}
</Fitness Profile>

**Now reply with the single JSON object only - no additional text.**
`;
  