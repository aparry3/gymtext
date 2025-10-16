import { FitnessProfileContext } from '@/server/services/context/fitnessProfileContext';
import { WORKOUT_MESSAGE_SYSTEM_PROMPT, buildWorkoutUserMessage } from './prompts';
import { initializeModel } from '../../base';
import { WorkoutMessageContext, WorkoutMessageInput } from './types';
import { WorkoutInstance, EnhancedWorkoutInstance } from '@/server/models/workout';
import { UserWithProfile } from '@/server/models/user';
import { Message } from '@/server/models/conversation';

/**
 * Generates a daily workout message
 *
 * Creates a motivational, forward-looking SMS message for daily workout delivery
 *
 * @param user - User with profile information
 * @param workout - Workout instance to deliver
 * @param previousMessages - Optional previous messages for context
 * @returns SMS message string
 */
export const generateDailyWorkoutMessage = async (
  user: UserWithProfile,
  workout: WorkoutInstance | EnhancedWorkoutInstance,
  previousMessages?: Message[]
): Promise<string> => {
  return generateWorkoutMessage({
    user,
    workout,
    type: 'daily',
    previousMessages
  });
};

/**
 * Generates a modified workout message
 *
 * Creates a conversational, explanatory SMS message acknowledging workout modifications
 *
 * @param user - User with profile information
 * @param workout - Workout instance (modified)
 * @param context - Context about the modification
 * @returns SMS message string
 */
export const generateModifiedWorkoutMessage = async (
  user: UserWithProfile,
  workout: WorkoutInstance | EnhancedWorkoutInstance,
  context: Omit<WorkoutMessageContext, 'type'>
): Promise<string> => {
  return generateWorkoutMessage({
    user,
    workout,
    type: 'modified',
    context
  });
};

/**
 * Internal workout message generator
 *
 * Core logic for generating SMS workout messages using LangChain
 * Follows the agent pattern: static system prompt + dynamic user message
 *
 * @param input - Complete workout message input
 * @returns SMS message string
 */
const generateWorkoutMessage = async (input: WorkoutMessageInput): Promise<string> => {
  // Initialize model
  const llm = initializeModel(undefined);

  // Get fitness profile context
  const fitnessProfileSubstring = await new FitnessProfileContext().getContext(input.user);

  // Build messages using agent pattern
  const systemMessage = {
    role: 'system',
    content: WORKOUT_MESSAGE_SYSTEM_PROMPT,
  };

  const userMessage = {
    role: 'user',
    content: buildWorkoutUserMessage(input, fitnessProfileSubstring),
  };

  // Generate message
  const response = await llm.invoke([systemMessage, userMessage]);
  const messageContent = typeof response.content === 'string'
    ? response.content
    : String(response.content);

  return messageContent;
};