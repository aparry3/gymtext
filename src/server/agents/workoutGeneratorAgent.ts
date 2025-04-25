import { recall } from '../db/vector/memoryTools';
import { getUserWithProfile } from '../db/postgres/users';
import { dailyPrompt } from '../prompts/templates';
import { z } from 'zod';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { getDatesUntilSaturday } from '@/shared/utils';
import { twilioClient } from '../clients/twilio';

const llm = new ChatGoogleGenerativeAI({ temperature: 0.3, model: 'gemini-2.0-flash' });

const daySchema = z.object({
  date: z.string(),
  workout: z.string(),
  equipment: z.array(z.string())
})

// Define the schema for the weekly workout plan
// const weeklyWorkoutSchema = z.object({
//   sunday: daySchema,
//   monday: daySchema,
//   tuesday: daySchema,
//   wednesday: daySchema,
//   thursday: daySchema,
//   friday: daySchema,
//   saturday: daySchema,
// })

export async function generateWeeklyPlan(userId: string) {
  const user = await getUserWithProfile(userId);
  if (!user) throw new Error('User not found');
  // if (!outline) throw new Error('No program outline found');

  const profile = await recall({userId, text: 'workout plan outline'});
  const modelWithStructuredOutput = llm.withStructuredOutput(daySchema);

  const dates = getDatesUntilSaturday(new Date());
  const workouts = await Promise.all(dates.map(async (date) => {
    const prompt = dailyPrompt(user, date, profile.map(record => record.metadata?.text).join('\n'), '');
    const resp = await modelWithStructuredOutput.invoke(prompt);
    return {...resp, day: date.toLocaleDateString('en-US', { weekday: 'long' })};
  }))
  const workout = workouts.find(workout => workout.day === new Date().toLocaleDateString('en-US', { weekday: 'long' }))
  if (!workout) throw new Error('No workout for today')

  await twilioClient.sendSMS(user.phone_number, workout.workout);

  return workouts;
}