import { describe, it, expect } from 'vitest';
import { OnboardingChatService } from '@/server/services/onboardingChatService';

describe('Onboarding Age Collection', () => {
  it('should include age in required fields when missing', () => {
    const service = new OnboardingChatService();
    const privateService = service as any;
    
    const missingFields = privateService.computePendingRequiredFields(
      { gender: 'male', primaryGoal: 'strength' }, // profile has these but missing age
      { name: 'Test', phoneNumber: '+15551234567', timezone: 'America/New_York', preferredSendHour: 8 }
    );
    
    expect(missingFields).toContain('age');
    expect(missingFields).not.toContain('name');
    expect(missingFields).not.toContain('phone');
    expect(missingFields).not.toContain('timezone');
    expect(missingFields).not.toContain('preferredSendHour');
    expect(missingFields).not.toContain('gender');
    expect(missingFields).not.toContain('primaryGoal');
  });

  it('should not require age when provided', () => {
    const service = new OnboardingChatService();
    const privateService = service as any;
    
    const missingFields = privateService.computePendingRequiredFields(
      { gender: 'female', primaryGoal: 'endurance', age: 25 }, // age provided
      { 
        name: 'Test', 
        phoneNumber: '+15551234567',
        timezone: 'America/New_York',
        preferredSendHour: 7
      }
    );
    
    expect(missingFields).toEqual([]);
  });

  it('should include age with other missing fields', () => {
    const service = new OnboardingChatService();
    const privateService = service as any;
    
    const missingFields = privateService.computePendingRequiredFields(
      {}, // missing everything from profile
      { name: 'Test' } // only name provided
    );
    
    expect(missingFields).toContain('age');
    expect(missingFields).toContain('gender');
    expect(missingFields).toContain('primaryGoal');
    expect(missingFields).toContain('phone');
    expect(missingFields).toContain('timezone');
    expect(missingFields).toContain('preferredSendHour');
    expect(missingFields).not.toContain('name');
  });

  it('should handle age with gender and other personal info', () => {
    const service = new OnboardingChatService();
    const privateService = service as any;
    
    // Missing only personal demographic info
    const missingFields = privateService.computePendingRequiredFields(
      { primaryGoal: 'muscle-gain' }, // goal provided, but missing age and gender
      { 
        name: 'Test', 
        phoneNumber: '+15551234567',
        timezone: 'America/Los_Angeles',
        preferredSendHour: 6
      }
    );
    
    expect(missingFields).toEqual(['gender', 'age']); // Only demographic info missing
  });
});