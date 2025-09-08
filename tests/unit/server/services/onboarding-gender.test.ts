import { describe, it, expect } from 'vitest';
import { OnboardingChatService } from '@/server/services/onboardingChatService';

describe('Onboarding Gender Requirements', () => {
  it('should include gender in required fields when missing', async () => {
    const service = new OnboardingChatService();
    
    const events = [];
    for await (const event of service.streamMessage({
      message: "Hi there!",
      currentUser: { name: 'Test User' }, // Missing phone, timezone, preferredSendHour
      currentProfile: {}, // Missing primaryGoal, gender
    })) {
      events.push(event);
    }
    
    const readyToSaveEvent = events.find(e => e.type === 'ready_to_save');
    expect(readyToSaveEvent).toBeDefined();
    expect(readyToSaveEvent?.data.canSave).toBe(false);
    expect(readyToSaveEvent?.data.missing).toContain('gender');
    expect(readyToSaveEvent?.data.missing).toContain('primaryGoal');
    expect(readyToSaveEvent?.data.missing).toContain('phone');
  });

  it('should not require gender when already provided', async () => {
    const service = new OnboardingChatService();
    
    const events = [];
    for await (const event of service.streamMessage({
      message: "I want to build muscle",
      currentUser: { 
        name: 'Test User',
        phoneNumber: '+15551234567',
        timezone: 'America/New_York',
        preferredSendHour: 8
      },
      currentProfile: { 
        gender: 'male' // Gender already provided
      }
    })) {
      events.push(event);
    }
    
    const readyToSaveEvent = events.find(e => e.type === 'ready_to_save');
    expect(readyToSaveEvent).toBeDefined();
    expect(readyToSaveEvent?.data.missing).not.toContain('gender');
    // Should only be missing primaryGoal now
    expect(readyToSaveEvent?.data.missing).toEqual(['primaryGoal']);
  });

  it('should be ready to save when all required fields including gender are provided', async () => {
    const service = new OnboardingChatService();
    
    const events = [];
    for await (const event of service.streamMessage({
      message: "I want to build muscle",
      currentUser: { 
        name: 'Test User',
        phoneNumber: '+15551234567',
        timezone: 'America/New_York',
        preferredSendHour: 8
      },
      currentProfile: { 
        gender: 'male',
        primaryGoal: 'muscle-gain'
      }
    })) {
      events.push(event);
    }
    
    const readyToSaveEvent = events.find(e => e.type === 'ready_to_save');
    expect(readyToSaveEvent).toBeDefined();
    expect(readyToSaveEvent?.data.canSave).toBe(true);
    expect(readyToSaveEvent?.data.missing).toEqual([]);
  });
});