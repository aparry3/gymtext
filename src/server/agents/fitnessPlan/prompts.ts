import { UserWithProfile } from "@/server/models/userModel";

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
  