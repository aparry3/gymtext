import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { RunnableSequence } from '@langchain/core/runnables';
import { dailyMotivationPrompt, workoutReminderPrompt, progressCheckPrompt } from '@/server/agents/dailyMessage/prompts';
import { UserRepository } from '@/server/repositories/userRepository';
import { WorkoutInstanceRepository } from '@/server/repositories/workoutInstanceRepository';
import { twilioClient } from '@/server/connections/twilio/twilio';

const llm = new ChatGoogleGenerativeAI({ temperature: 0.8, model: "gemini-2.0-flash" });

export const dailyMessageChain = RunnableSequence.from([
  async ({ userId, messageType = 'motivation' }: { userId: string; messageType?: 'motivation' | 'reminder' | 'progress' }) => {
    // Get user information
    const userRepo = new UserRepository();
    const user = await userRepo.findWithProfile(userId);
    if (!user) throw new Error('User not found');
    
    // Get today's workout if any
    const workoutRepo = new WorkoutInstanceRepository();
    const today = new Date();
    const todaysWorkout = await workoutRepo.findByUserAndDate(userId, today);
    
    // Get recent workout completion data
    const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentWorkouts = await workoutRepo.findByUserDateRange(userId, last7Days, today);
    const completedWorkouts = recentWorkouts.filter(w => w.completedAt);
    
    return {
      user,
      messageType,
      todaysWorkout,
      weeklyStats: {
        totalWorkouts: recentWorkouts.length,
        completedWorkouts: completedWorkouts.length,
        streak: await calculateWorkoutStreak(userId)
      }
    };
  },
  
  async ({ user, messageType, todaysWorkout, weeklyStats }) => {
    let prompt;
    let messageContent;
    
    switch (messageType) {
      case 'reminder':
        if (todaysWorkout) {
          prompt = workoutReminderPrompt(user, todaysWorkout);
          messageContent = await llm.invoke(prompt);
        } else {
          return { user, message: null, sent: false };
        }
        break;
        
      case 'progress':
        prompt = progressCheckPrompt(user, weeklyStats);
        messageContent = await llm.invoke(prompt);
        break;
        
      default: // motivation
        prompt = dailyMotivationPrompt(user, weeklyStats);
        messageContent = await llm.invoke(prompt);
    }
    
    return {
      user,
      message: messageContent.content,
      messageType,
      todaysWorkout
    };
  },
  
  async ({ user, message, messageType }) => {
    if (!message) {
      return { sent: false, reason: 'No message generated' };
    }
    
    // Send SMS
    try {
      await twilioClient.sendSMS(user.phoneNumber, message);
      
      return {
        sent: true,
        userId: user.id,
        messageType,
        message,
        sentAt: new Date()
      };
    } catch (error) {
      console.error('Failed to send daily message:', error);
      return {
        sent: false,
        error: error instanceof Error ? error.message : String(error),
        userId: user.id
      };
    }
  }
]);

export const bulkDailyMessageChain = RunnableSequence.from([
  async ({ userIds, messageType = 'motivation' }: { userIds: string[]; messageType?: 'motivation' | 'reminder' | 'progress' }) => {
    const results = [];
    
    for (const userId of userIds) {
      try {
        const result = await dailyMessageChain.invoke({ userId, messageType: messageType as 'motivation' | 'reminder' | 'progress' });
        results.push(result);
      } catch (error) {
        results.push({
          sent: false,
          userId,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
    
    return {
      results,
      totalUsers: userIds.length,
      successCount: results.filter(r => r.sent).length,
      failureCount: results.filter(r => !r.sent).length
    };
  },
  // Identity function to satisfy RunnableSequence requirement of at least 2 items
  (result) => result
]);

async function calculateWorkoutStreak(userId: string): Promise<number> {
  const workoutRepo = new WorkoutInstanceRepository();
  const today = new Date();
  let streak = 0;
  const currentDate = new Date(today);
  
  // Look back up to 30 days to calculate streak
  for (let i = 0; i < 30; i++) {
    const workouts = await workoutRepo.findByUserAndDate(userId, currentDate);
    const hasCompletedWorkout = workouts.some(w => w.completedAt);
    
    if (hasCompletedWorkout) {
      streak++;
    } else {
      break;
    }
    
    currentDate.setDate(currentDate.getDate() - 1);
  }
  
  return streak;
}