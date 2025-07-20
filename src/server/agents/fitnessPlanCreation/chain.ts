import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { RunnableSequence } from '@langchain/core/runnables';
import { fitnessProfileSubstring, outlinePrompt, welcomePrompt } from '@/server/prompts/templates';
import { UserRepository } from '@/server/repositories/userRepository';
import { UserWithProfile } from '@/server/models/_types';
import { twilioClient } from '@/server/connections/twilio/twilio';
import { FitnessProgramSchema, FitnessProgram } from '@/server/models/_types';
import { FitnessPlanService } from '@/server/services/fitnessPlanService';
import { FitnessPlanRepository } from '@/server/repositories/fitnessPlanRepository';

const llm = new ChatGoogleGenerativeAI({ temperature: 0.3, model: "gemini-2.0-flash" });

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
    const prompt = outlinePrompt(user, fitnessProfile);
    const structuredModel = llm.withStructuredOutput(FitnessProgramSchema);
    
    const result = await structuredModel.invoke(prompt);
    return { user, program: result };
  },

  // Step 3: Save the plan and send welcome message
  async ({ user, program }: { user: UserWithProfile; program: FitnessProgram }) => {
    // Save the fitness plan
    const planRepository = new FitnessPlanRepository();
    const startDate = new Date();
    const savedPlan = await planRepository.createFromProgram(
      user.id, 
      program, 
      startDate,
      `Customized fitness plan for ${user.name}`
    );

    // Send welcome message via SMS
    const welcomeMessage = welcomePrompt(user, program);
    await twilioClient.messages.create({
      body: welcomeMessage,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: user.phoneNumber,
    });

    return { user, program, savedPlan, welcomeMessage };
  }
]);

export const createFitnessPlanChain = RunnableSequence.from([
  async ({ userId, customGoals }: { userId: string; customGoals?: string }) => {
    const userRepository = new UserRepository();
    const user = await userRepository.findWithProfile(userId);
    if (!user || !user.profile) throw new Error('User or fitness profile not found');
    
    const fitnessProfile = fitnessProfileSubstring(user);
    const prompt = customGoals 
      ? outlinePrompt(user, fitnessProfile, customGoals)
      : outlinePrompt(user, fitnessProfile);
    
    const structuredModel = llm.withStructuredOutput(FitnessProgramSchema);
    const program = await structuredModel.invoke(prompt);
    
    return { user, program };
  }
]);