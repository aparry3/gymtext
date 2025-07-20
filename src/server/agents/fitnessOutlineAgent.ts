import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { RunnableSequence } from '@langchain/core/runnables';
import { fitnessProfileSubstring, outlinePrompt, welcomePrompt } from '../prompts/templates';
import { UserRepository } from '../data/repositories/userRepository';
import { UserWithProfile } from '@/shared/types/user';
import { twilioClient } from '../core/clients/twilio';
import { FitnessProgramSchema, FitnessProgram } from '@/shared/types/cycles';
import { FitnessPlanService } from '@/server/services/fitness/FitnessPlanService';
import { FitnessPlanRepository } from '../data/repositories/fitnessPlanRepository';
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
    // Remove vector memory storage - database is our single source of truth
    // await remember({userId: user.id, key: 'fitness_profile',text: fitnessProfile});
    const prompt = outlinePrompt(user, fitnessProfile);
    const structuredModel = llm.withStructuredOutput(FitnessProgramSchema);
    const program = await structuredModel.invoke(prompt);
    console.log('program', JSON.stringify(program, null, 2));
    return { user, program };
  },

  // Step 3: Store the workout plan in the database
  async ({ user, program }: { user: UserWithProfile; program: FitnessProgram }) => {
    const fitnessPlanService = new FitnessPlanService(
      new FitnessPlanRepository()
    );
    
    // Determine start date (today for now, could be customized)
    const startDate = new Date();
    
    // Extract goal statement from fitness goals
    const goalStatement = user.profile?.fitnessGoals || undefined;
    
    // Save to database using the service
    const savedPlan = await fitnessPlanService.createFromProgram(
      user.id,
      program,
      startDate,
      goalStatement
    );
    
    console.log('Saved fitness plan to database:', savedPlan.id);
    
    // Remove vector memory storage - database is our single source of truth
    // await remember({userId: user.id, key: 'outline', text: `Outline: ${program}`});
    
    return { user, program, savedPlan };
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
  const outlineText = JSON.stringify(result.program);
  console.log('messageText', messageText);
  console.log('result.user.phoneNumber', result.user.phoneNumber);
  await twilioClient.sendSMS(result.user.phoneNumber, messageText);
  return outlineText;
}
