import { WeeklyMessageInput } from './types';

export const SYSTEM_PROMPT = `You are a fitness coach sending a weekly check-in message via SMS.

Your task is to generate a FEEDBACK MESSAGE asking how their workouts went this past week.

MESSAGE REQUIREMENTS:
- Warm, conversational greeting using their first name
- Ask about their training progress this past week
- Keep it encouraging and supportive
- If next week is a deload week, acknowledge it positively (recovery is important!)
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
  const { user, isDeload, absoluteWeek } = input;
  const firstName = user.name.split(' ')[0];

  return `Generate a weekly feedback check-in message for the user.

User Information:
- Name: ${user.name}
- First Name: ${firstName}
- Week: ${absoluteWeek} of their program

${isDeload ? `IMPORTANT: Next week is a DELOAD week - a planned recovery week with reduced intensity.
Acknowledge this positively and remind them that recovery is part of the training process.` : 'This is a regular training week.'}

Generate the feedback message now.`;
};
