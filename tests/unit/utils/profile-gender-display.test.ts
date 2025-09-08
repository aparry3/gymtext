import { describe, it, expect } from 'vitest';
import { processProfileData, processUserData, calculateProfileCompleteness } from '@/utils/profile/profileProcessors';
import { determineSectionOrder } from '@/utils/profile/sectionVisibility';

describe('Profile Gender Display', () => {
  it('should process gender in profile data', () => {
    const profileData = processProfileData({
      gender: 'male',
      age: 28,
      primaryGoal: 'strength'
    });
    
    expect(profileData.gender).toBe('male');
    expect(profileData.age).toBe(28);
  });

  it('should handle different gender options', () => {
    const testCases = [
      { input: 'male', expected: 'male' },
      { input: 'female', expected: 'female' },
      { input: 'non-binary', expected: 'non-binary' },
      { input: 'prefer-not-to-say', expected: 'prefer-not-to-say' }
    ];

    testCases.forEach(({ input, expected }) => {
      const profileData = processProfileData({ gender: input });
      expect(profileData.gender).toBe(expected);
    });
  });

  it('should include gender and age in section data counting', () => {
    const userData = processUserData({
      name: 'Test User',
      email: 'test@example.com'
    });
    
    const profileData = processProfileData({
      gender: 'female',
      age: 25
    });
    
    const sections = determineSectionOrder(userData, profileData);
    const personalInfoSection = sections.find(s => s.id === 'personalInfo');
    
    expect(personalInfoSection?.hasData).toBe(true);
    expect(personalInfoSection?.dataCount).toBe(4); // name, email, gender, age
  });

  it('should include gender and age in profile completeness calculation', () => {
    const userData = processUserData({
      name: 'Test User',
      phoneNumber: '+15551234567'
    });
    
    const profileDataWithoutGender = processProfileData({
      primaryGoal: 'strength'
    });
    
    const profileDataWithGender = processProfileData({
      primaryGoal: 'strength',
      gender: 'male',
      age: 30
    });
    
    const completenessWithoutGender = calculateProfileCompleteness(userData, profileDataWithoutGender);
    const completenessWithGender = calculateProfileCompleteness(userData, profileDataWithGender);
    
    expect(completenessWithGender).toBeGreaterThan(completenessWithoutGender);
  });

  it('should validate age bounds', () => {
    const validAge = processProfileData({ age: 30 });
    expect(validAge.age).toBe(30);
    
    const minValidAge = processProfileData({ age: 13 });
    expect(minValidAge.age).toBe(13);
    
    const tooYoung = processProfileData({ age: 12 });
    expect(tooYoung.age).toBe(null);
    
    const tooOld = processProfileData({ age: 150 });
    expect(tooOld.age).toBe(null);
  });

  it('should handle null/undefined gender and age gracefully', () => {
    const emptyProfile = processProfileData({});
    expect(emptyProfile.gender).toBe(null);
    expect(emptyProfile.age).toBe(null);
    
    const nullProfile = processProfileData({ gender: null, age: null });
    expect(nullProfile.gender).toBe(null);
    expect(nullProfile.age).toBe(null);
  });
});