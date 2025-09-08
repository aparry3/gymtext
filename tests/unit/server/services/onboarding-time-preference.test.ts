import { describe, it, expect } from 'vitest';
import { OnboardingChatService } from '@/server/services/onboardingChatService';

describe('Onboarding Time Preference Collection', () => {
  it('should include timezone and preferredSendHour in required fields when missing', async () => {
    const service = new OnboardingChatService();
    
    const events = [];
    for await (const event of service.streamMessage({
      message: "Hi, I want to get in shape!",
      currentUser: { 
        name: 'Test User',
        phoneNumber: '+15551234567'
        // Missing timezone and preferredSendHour
      },
      currentProfile: { 
        gender: 'male',
        primaryGoal: 'general-fitness'
      }
    })) {
      events.push(event);
    }
    
    const readyToSaveEvent = events.find(e => e.type === 'ready_to_save');
    expect(readyToSaveEvent).toBeDefined();
    expect(readyToSaveEvent?.data.canSave).toBe(false);
    expect(readyToSaveEvent?.data.missing).toContain('timezone');
    expect(readyToSaveEvent?.data.missing).toContain('preferredSendHour');
  });

  it('should be ready to save when time preferences are provided', async () => {
    const service = new OnboardingChatService();
    
    const events = [];
    for await (const event of service.streamMessage({
      message: "I'd like to receive workouts at 7am Eastern time",
      currentUser: { 
        name: 'Test User',
        phoneNumber: '+15551234567'
        // Time info should be extracted from message
      },
      currentProfile: { 
        gender: 'male',
        primaryGoal: 'general-fitness'
      }
    })) {
      events.push(event);
    }
    
    // Should extract timezone and preferredSendHour from the message
    const userUpdateEvent = events.find(e => e.type === 'user_update');
    expect(userUpdateEvent).toBeDefined();
    
    const readyToSaveEvent = events.find(e => e.type === 'ready_to_save');
    expect(readyToSaveEvent).toBeDefined();
    // Should be ready to save after extracting time preferences
    expect(readyToSaveEvent?.data.canSave).toBe(true);
    expect(readyToSaveEvent?.data.missing).toEqual([]);
  });

  it('should ask for time preference when only that field is missing', async () => {
    const service = new OnboardingChatService();
    
    const events = [];
    for await (const event of service.streamMessage({
      message: "What's next?",
      currentUser: { 
        name: 'Test User',
        phoneNumber: '+15551234567'
        // Missing timezone and preferredSendHour only
      },
      currentProfile: { 
        gender: 'female',
        primaryGoal: 'strength'
      }
    })) {
      events.push(event);
    }
    
    const readyToSaveEvent = events.find(e => e.type === 'ready_to_save');
    expect(readyToSaveEvent).toBeDefined();
    expect(readyToSaveEvent?.data.canSave).toBe(false);
    expect(readyToSaveEvent?.data.missing).toEqual(['timezone', 'preferredSendHour']);
    
    // Check that the response asks about time preferences
    const tokenEvents = events.filter(e => e.type === 'token');
    const fullResponse = tokenEvents.map(e => e.data).join('');
    expect(fullResponse.toLowerCase()).toMatch(/time|when|workout/i);
  });

  it('should handle descriptive time preferences like morning and evening', async () => {
    const service = new OnboardingChatService();
    
    const events = [];
    for await (const event of service.streamMessage({
      message: "I prefer morning workouts around 6am Pacific time",
      currentUser: { 
        name: 'Test User',
        phoneNumber: '+15551234567'
      },
      currentProfile: { 
        gender: 'non-binary',
        primaryGoal: 'endurance'
      }
    })) {
      events.push(event);
    }
    
    // Should extract both specific time (6am) and timezone (Pacific)
    const userUpdateEvent = events.find(e => e.type === 'user_update');
    if (userUpdateEvent) {
      // Timezone and time should be extracted
      const userData = userUpdateEvent.data;
      expect(userData).toBeDefined();
    }
    
    const readyToSaveEvent = events.find(e => e.type === 'ready_to_save');
    expect(readyToSaveEvent).toBeDefined();
    expect(readyToSaveEvent?.data.canSave).toBe(true);
  });
});