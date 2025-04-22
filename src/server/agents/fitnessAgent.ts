import { ChatOpenAI } from '@langchain/openai';
import { RunnableSequence } from '@langchain/core/runnables';
import { outlinePrompt, weeklyPrompt, updatePrompt, welcomePrompt } from '../prompts/templates';
import { recall } from '../db/vector/memoryTools';
import { getLatestProgramOutline, createProgramOutline, getUserWithProfile, UserWithProfile } from '../db/postgres/users';
import { WeeklyWorkout } from '../types/weeklyWorkout';
import { UpdateContext } from '../types/updateContext';
import { openAICreateProgramOutlineSchema } from '@/shared/schemas/programOutline';
import { twilioClient } from '../clients/twilio';
import { openAIWelcomeMessageSchema } from '@/shared/schemas/welcomeMessage';


const llm = new ChatOpenAI({ temperature: 0.3, modelName: 'gpt-4o-mini' });

export const onboardUserChain = RunnableSequence.from([
  // Step 1: Fetch user info and profile
  async (userId: string) => {
    const user = await getUserWithProfile(userId);
    if (!user || !user.profile) throw new Error('User or fitness profile not found');
    return { user };
  },
  // Step 2: Use the profile to create a workout plan outline
  async ({ user }: { user: UserWithProfile }) => {
    const prompt = outlinePrompt(user);
    console.log(prompt);
    const modelWithJsonOutput = llm.withStructuredOutput(openAICreateProgramOutlineSchema);
    const outlineResp = await modelWithJsonOutput.invoke(prompt);
    console.log(outlineResp);
    return { user, outline: outlineResp, outlineContent: JSON.stringify(outlineResp) };
  },
  // Step 3: Store the workout plan outline in the DB and remember it
  async ({ user, outline }) => {
    await createProgramOutline(user.id, outline);
    // await remember(user.id, `Outline: ${outlineContent}`);
    return { user, outline };
  },
  // Step 4: Summarize the outline and create a welcome message for the user
  async ({ user, outline }) => {
    const welcomePromptText = welcomePrompt(user, outline);
    const llmWithJsonOutput = llm.withStructuredOutput(openAIWelcomeMessageSchema);
    const welcomeResp = await llmWithJsonOutput.invoke(welcomePromptText);
    // await remember(user.id, `Welcome: ${welcomeMessage}`);
    return { user, message: welcomeResp.message };
  },
  // Step 5: Return the welcome message
]);

export async function onboardUser({ userId }: { userId: string }): Promise<string> {
  const result = await onboardUserChain.invoke(userId);
  await twilioClient.sendSMS(result.user.phone_number, result.message);
  return result.message;
}

export async function generateWeeklyPlan(userId: string) {
  const outline = await getLatestProgramOutline(userId);
  if (!outline) throw new Error('No program outline found');

  const pastWeeks = await recall(userId, 'past weeks');
  const formattedWeeks = pastWeeks.map(record => record.metadata as unknown as WeeklyWorkout);
  const prompt = weeklyPrompt(outline, formattedWeeks);
  const resp = await llm.invoke(prompt);
  const content = typeof resp.content === 'string' ? resp.content : JSON.stringify(resp.content);
  return JSON.parse(content);
}

export async function processUpdate(userId: string, message: string) {
  const context = await recall(userId, message);
  const formattedContext = context.map(record => record.metadata as unknown as UpdateContext);
  const prompt = updatePrompt(message, formattedContext);
  const resp = await llm.invoke(prompt);
  const content = typeof resp.content === 'string' ? resp.content : JSON.stringify(resp.content);
  return JSON.parse(content);
} 