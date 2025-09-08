import { describe, it, expect } from 'vitest';
import { OnboardingChatService } from '@/server/services/onboardingChatService';

describe('Onboarding Time Preference Logic', () => {
  it('should include timezone and preferredSendHour in missing required fields', () => {
    const service = new OnboardingChatService();
    
    // Test the private computePendingRequiredFields method using TypeScript's type assertion
    const privateService = service as any;
    
    const missingFields = privateService.computePendingRequiredFields(
      { gender: 'male', primaryGoal: 'strength' }, // profile has these
      { name: 'Test', phoneNumber: '+15551234567' } // user has these but missing timezone/preferredSendHour
    );
    
    expect(missingFields).toContain('timezone');
    expect(missingFields).toContain('preferredSendHour');
    expect(missingFields).not.toContain('name');
    expect(missingFields).not.toContain('phone');
    expect(missingFields).not.toContain('gender');
    expect(missingFields).not.toContain('primaryGoal');
  });

  it('should not require timezone and preferredSendHour when provided', () => {
    const service = new OnboardingChatService();
    const privateService = service as any;
    
    const missingFields = privateService.computePendingRequiredFields(
      { gender: 'female', primaryGoal: 'endurance' },
      { 
        name: 'Test', 
        phoneNumber: '+15551234567',
        timezone: 'America/New_York',
        preferredSendHour: 7
      }
    );
    
    expect(missingFields).toEqual([]);
  });

  it('should require time fields when user info is incomplete', () => {
    const service = new OnboardingChatService();
    const privateService = service as any;
    
    const missingFields = privateService.computePendingRequiredFields(
      { gender: 'non-binary', primaryGoal: 'muscle-gain' },
      { 
        name: 'Test', 
        phoneNumber: '+15551234567',
        // Missing timezone and preferredSendHour
      }
    );
    
    expect(missingFields).toEqual(['timezone', 'preferredSendHour']);
  });

  it('should handle partial time info correctly', () => {
    const service = new OnboardingChatService();
    const privateService = service as any;
    
    // Only timezone missing
    const missingFields1 = privateService.computePendingRequiredFields(
      { gender: 'male', primaryGoal: 'fat-loss' },
      { 
        name: 'Test', 
        phoneNumber: '+15551234567',
        preferredSendHour: 8
        // Missing timezone
      }
    );
    expect(missingFields1).toEqual(['timezone']);

    // Only preferredSendHour missing  
    const missingFields2 = privateService.computePendingRequiredFields(
      { gender: 'female', primaryGoal: 'general-fitness' },
      { 
        name: 'Test', 
        phoneNumber: '+15551234567',
        timezone: 'America/Los_Angeles'
        // Missing preferredSendHour
      }
    );
    expect(missingFields2).toEqual(['preferredSendHour']);
  });
});