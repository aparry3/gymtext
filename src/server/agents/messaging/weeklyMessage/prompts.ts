import { WeeklyMessageInput } from './types';

export const SYSTEM_PROMPT = `You are a fitness coach sending a weekly check-in message via SMS.

Your task is to generate TWO distinct messages:

1. FEEDBACK MESSAGE: A warm greeting asking how their workouts went this week
   - Keep it conversational and encouraging
   - Use their first name
   - Around 20-30 words

2. BREAKDOWN MESSAGE: A summary of next week's training pattern
   - Start with a brief intro about the upcoming week
   - List each training day with its focus (e.g., "Monday: Upper Body Strength")
   - If it's the first week of a new mesocycle phase, mention the phase transition
   - End with an invitation to request changes if needed
   - Keep the whole message under 300 characters for SMS

Tone:
- Supportive and motivating
- Concise (SMS format)
- Professional but friendly
- Action-oriented

Format:
Return a JSON object with two fields:
{
  "feedbackMessage": "...",
  "breakdownMessage": "..."
}`;

export const userPrompt = (input: WeeklyMessageInput): string => {
  const { user, nextWeekMicrocycle, isNewMesocycle, mesocycleName } = input;

  // Extract training days from the pattern
  const trainingDays = nextWeekMicrocycle.days
    .filter(day => !day.theme.toLowerCase().includes('rest'))
    .map(day => `${day.day}: ${day.theme}`)
    .join('\n');

  const restDays = nextWeekMicrocycle.days
    .filter(day => day.theme.toLowerCase().includes('rest'))
    .map(day => day.day)
    .join(', ');

  return `Generate weekly check-in messages for the user.

User Information:
- Name: ${user.name}
- First Name: ${user.name.split(' ')[0]}

Next Week's Training Pattern:
${trainingDays}
${restDays ? `Rest Days: ${restDays}` : ''}

${isNewMesocycle ? `IMPORTANT: Next week is the first week of a new mesocycle phase: "${mesocycleName}"
Include this transition in the breakdown message.` : ''}

Generate both messages now.`;
};
