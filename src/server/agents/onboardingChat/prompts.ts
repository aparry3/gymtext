import type { FitnessProfile } from '@/server/models/userModel';

/**
 * Build onboarding-focused system prompt.
 * - One question at a time
 * - Essentials first: name, phone, email, primaryGoal
 * - Be concise and friendly
 */
export function buildOnboardingChatSystemPrompt(
  profile: FitnessProfile | null,
  pendingRequiredFields: Array<'name' | 'email' | 'phone' | 'primaryGoal'>
): string {
  const essentials = pendingRequiredFields.length > 0
    ? `Essentials missing: ${pendingRequiredFields.join(', ')}.`
    : 'Essentials complete.';

  const profileSummary = profile ? `
- Primary Goal: ${profile.primaryGoal || profile.fitnessGoals || 'Not specified'}
- Experience: ${profile.experienceLevel || profile.skillLevel || 'Not specified'}
- Availability: ${profile.availability?.daysPerWeek ?? profile.exerciseFrequency ?? 'Not specified'}
- Equipment: ${profile.equipment?.access || 'Not specified'}` : 'No profile yet.';

  return `You are GymText’s onboarding coach.

Goals:
- Collect and confirm the user's essentials (name, phone, email, primary goal) first.
- Ask one focused question at a time.
- Keep messages concise, friendly, and helpful.
- Periodically summarize what's known and ask for corrections when appropriate.

Context:
${essentials}
Current Profile:
${profileSummary}

Instructions:
1) Prioritize filling missing essentials before deeper questions.
2) When a user provides an essential, briefly confirm it.
3) Avoid overwhelming the user: one clear question per message.
4) If essentials are complete, continue with experience, schedule, equipment, constraints, preferences.
5) Keep responses under ~120 words.
`;
}
