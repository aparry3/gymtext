import { UserWithProfile } from "@/server/models/userModel";
import { FitnessProgram } from "@/server/models/fitnessPlanModel";

export const fitnessProfileSubstring = (user: UserWithProfile) => `Client profile:
- Name: ${user.name}
- Experience level: ${user.profile?.skillLevel || 'Not specified'}
- Workout frequency: ${user.profile?.exerciseFrequency || 'Not specified'} times per week
- Age: ${user.profile?.age || 'Not specified'}
- Gender: ${user.profile?.gender || 'Not specified'}
- Fitness goals: ${user.profile?.fitnessGoals || 'Not specified'}
`;

export const outlinePrompt = (
  user: UserWithProfile,
  fitnessProfile: string,
  customGoals?: string
) => `
You are an elite personal fitness coach and periodisation expert.

<Goal>
Return **exactly one JSON object** that conforms to the FitnessProgram schema
(the schema is pre-loaded via the system and includes:
• a top-level "overview" string,
• macrocycles → mesocycles → weeklyTargets → (optional) microcycles).
</Goal>

<Schema highlights>
• Each \`WeeklyTarget\` must now include **split** — a short text blueprint of
  the weekly pattern (e.g. "Upper-Lower-HIIT-Rest").  
• \`metrics\` and \`targets\` use arrays of { key, value } pairs (Gemini-safe).  
• Objects are strict – no extra keys; no \`$ref\`; depth ≤ 5.  
</Schema highlights>

<Content guidelines>
- Use ${user.name}'s fitness profile (see below) for goals, experience,
  schedule and equipment.
${customGoals ? `- PRIORITY: Focus on these custom goals: ${customGoals}` : ''}
- Build **one macrocycle** that spans the requested timeframe.
- Inside it, create **mesocycles** of 3-6 weeks.
  • Give each mesocycle a \`weeklyTargets\` array that shows progressive
    overload (2-3 build weeks) followed by a deload week.  
  • Every element **must** contain \`split\`.
- Leave \`microcycles\` as empty arrays – they will be generated later.
- The \`overview\` (plain English) should be upbeat, ≤ 120 words.
- Output **only** the JSON object wrapped in a single \`\`\`json … \`\`\` block.
</Content guidelines>

${fitnessProfile}
`;

export const welcomePrompt = (user: UserWithProfile, program: FitnessProgram) => `
🎯 Welcome to GymText, ${user.name}!

Your personalized fitness program is ready! Here's what we've created for you:

${program.overview}

Your program includes:
• ${program.macrocycles.length} training phase${program.macrocycles.length > 1 ? 's' : ''}
• Progressive overload built in
• Customized for your ${user.profile?.skillLevel} level

We'll guide you through each workout with detailed instructions and track your progress. 

Ready to crush your fitness goals? Reply with any questions or just say "START" to begin your first workout!

💪 Let's do this!
`;