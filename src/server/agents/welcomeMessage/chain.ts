import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { RunnableSequence } from '@langchain/core/runnables';
import { welcomePrompt, onboardingPrompt } from './prompts';
import { UserRepository } from '../../repositories/userRepository';
import { twilioClient } from '../../connections/twilio/twilio';

const llm = new ChatGoogleGenerativeAI({ temperature: 0.7, model: "gemini-2.0-flash" });

export const welcomeMessageChain = RunnableSequence.from([
  async ({ userId, messageType = 'welcome' }: { userId: string; messageType?: 'welcome' | 'onboarding' }) => {
    // Get user information
    const userRepo = new UserRepository();
    const user = await userRepo.findWithProfile(userId);
    if (!user) throw new Error('User not found');
    
    return { user, messageType };
  },
  
  async ({ user, messageType }) => {
    let prompt;
    
    switch (messageType) {
      case 'onboarding':
        prompt = onboardingPrompt(user);
        break;
      default:
        prompt = welcomePrompt(user);
    }
    
    const messageContent = await llm.invoke(prompt);
    
    return {
      user,
      message: messageContent.content,
      messageType
    };
  },
  
  async ({ user, message, messageType }) => {
    // Send SMS
    try {
      await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: user.phoneNumber,
      });
      
      return {
        sent: true,
        userId: user.id,
        messageType,
        message,
        sentAt: new Date()
      };
    } catch (error) {
      console.error('Failed to send welcome message:', error);
      return {
        sent: false,
        error: error.message,
        userId: user.id
      };
    }
  }
]);

export const programWelcomeChain = RunnableSequence.from([
  async ({ userId, program }: { userId: string; program: any }) => {
    const userRepo = new UserRepository();
    const user = await userRepo.findWithProfile(userId);
    if (!user) throw new Error('User not found');
    
    const message = `🎯 Welcome to GymText, ${user.name}!

Your personalized fitness program is ready! Here's what we've created for you:

${program.overview}

Your program includes:
• ${program.macrocycles.length} training phase${program.macrocycles.length > 1 ? 's' : ''}
• Progressive overload built in
• Customized for your ${user.profile?.skillLevel} level

We'll guide you through each workout with detailed instructions and track your progress. 

Ready to crush your fitness goals? Reply with any questions or just say "START" to begin your first workout!

💪 Let's do this!`;

    // Send SMS
    try {
      await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: user.phoneNumber,
      });
      
      return {
        sent: true,
        userId: user.id,
        message,
        program,
        sentAt: new Date()
      };
    } catch (error) {
      console.error('Failed to send program welcome message:', error);
      return {
        sent: false,
        error: error.message,
        userId: user.id
      };
    }
  }
]);