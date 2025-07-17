import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { RunnableSequence } from '@langchain/core/runnables';
import { fitnessProfileSubstring, outlinePrompt, welcomePrompt } from '../prompts/templates';
import { UserRepository } from '../data/repositories/userRepository';
import { UserWithProfile } from '@/shared/types/user';
import { twilioClient } from '../core/clients/twilio';
import { remember } from '../services/ai/memoryService';
import { FitnessProgramSchema } from '@/shared/types/cycles';
// import { ChatOpenAI } from '@langchain/openai';

const llm = new ChatGoogleGenerativeAI({ temperature: 0.3, model: "gemini-2.0-flash" });
// const llm = new ChatOpenAI({ temperature: 0.3, model: "o3-mini-2025-01-31" });

export const onboardUserChain = RunnableSequence.from([
  // Step 1: Fetch user info and profile
  async (userId: string) => {
    const userRepository = new UserRepository();
    const user = await userRepository.findWithProfile(userId);
    if (!user || !user.profile) throw new Error('User or fitness profile not found');
    return { user };
  },

  // Step 2: Use the profile to create a workout plan outline
  async ({ user }: { user: UserWithProfile }) => {
    const fitnessProfile = fitnessProfileSubstring(user);
    await remember({userId: user.id, key: 'fitness_profile',text: fitnessProfile});
    const prompt = outlinePrompt(user, fitnessProfile);
    const structuredModel = llm.withStructuredOutput(FitnessProgramSchema);
    const program = await structuredModel.invoke(prompt);
    console.log('program', JSON.stringify(program, null, 2));
    return { user, program };
  },

  // Step 3: Store the workout plan outline in the DB and remember it
  async ({ user, program }) => {
    // await createProgramOutline(user.id, outline);
    await remember({userId: user.id, key: 'outline', text: `Outline: ${program}`});
    return { user, program };
  },

  // Step 4: Summarize the outline and create a welcome message for the user
  async ({ user, program }) => {
    const welcomePromptText = welcomePrompt(user, program);
    const welcomeResp = await llm.invoke(welcomePromptText);
    const welcomeContent = typeof welcomeResp.content === 'string'
      ? welcomeResp.content
      : String(welcomeResp.content);
    
    return { user, program, message: welcomeContent };
  },
  // Step 5: Return the welcome message
]);

export async function onboardUser({ userId }: { userId: string }): Promise<string> {
  const result = await onboardUserChain.invoke(userId);
  
  // At this point message should already be a string from our chain
  const messageText = String(result.message);
  const outlineText = String(result.program);
  console.log('messageText', messageText);
  console.log('result.user.phoneNumber', result.user.phoneNumber);
  await twilioClient.sendSMS(result.user.phoneNumber, messageText);
  return outlineText;
}
