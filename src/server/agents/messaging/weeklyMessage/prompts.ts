import { WeeklyMessageInput } from './types';

export const SYSTEM_PROMPT = `You are a fitness coach sending a weekly check-in message via SMS.

Your task is to generate a FEEDBACK MESSAGE asking how their workouts went this past week.

MESSAGE REQUIREMENTS:
- Warm, conversational greeting using their first name
- Ask about their training progress this past week
- Keep it encouraging and supportive
- If they're starting a new mesocycle phase, acknowledge the transition and congratulate them
- Keep it around 20-40 words total
- SMS-friendly format

Tone:
- Supportive and motivating
- Concise (SMS format)
- Professional but friendly
- Personal and caring

Format:
Return a JSON object with one field:
{
  "feedbackMessage": "..."
}`;

export const userPrompt = (input: WeeklyMessageInput): string => {
  const { user, isNewMesocycle, mesocycleName } = input;
  const firstName = user.name.split(' ')[0];

  return `Generate a weekly feedback check-in message for the user.

User Information:
- Name: ${user.name}
- First Name: ${firstName}

${isNewMesocycle ? `IMPORTANT: Next week is the first week of a new mesocycle phase: "${mesocycleName}"
Acknowledge this transition and congratulate them on completing the previous phase.` : 'This is a regular weekly check-in during an ongoing mesocycle phase.'}

Generate the feedback message now.`;
};
