import { describe, it, expect } from 'vitest';
import { testProfileExtraction } from '@/server/agents/profile/chain';

describe('Profile Agent Time Preference Extraction', () => {
  it('should extract explicit time preferences', async () => {
    const result = await testProfileExtraction(
      "I'd like to receive my daily workouts at 6am Eastern time",
      {},
      { name: 'Test User' }
    );
    
    expect(result.wasUpdated).toBe(true);
    expect(result.user?.timezone).toMatch(/america\/new_york|eastern/i);
    expect(result.user?.preferredSendHour).toBe(6);
  });

  it('should extract morning preferences', async () => {
    const result = await testProfileExtraction(
      "I prefer morning workouts, usually around 7am Pacific time",
      {},
      {}
    );
    
    expect(result.wasUpdated).toBe(true);
    expect(result.user?.timezone).toMatch(/america\/los_angeles|pacific/i);
    expect(result.user?.preferredSendHour).toBe(7);
  });

  it('should extract evening preferences', async () => {
    const result = await testProfileExtraction(
      "Send me workouts in the evening, like 6pm EST",
      {},
      {}
    );
    
    expect(result.wasUpdated).toBe(true);
    expect(result.user?.timezone).toMatch(/america\/new_york|eastern/i);
    expect(result.user?.preferredSendHour).toBe(18);
  });

  it('should extract timezone from city names', async () => {
    const result = await testProfileExtraction(
      "I'm in Los Angeles and would like workouts at 8am",
      {},
      {}
    );
    
    expect(result.wasUpdated).toBe(true);
    expect(result.user?.timezone).toMatch(/america\/los_angeles|pacific/i);
    expect(result.user?.preferredSendHour).toBe(8);
  });

  it('should handle descriptive time preferences', async () => {
    const result = await testProfileExtraction(
      "I usually work out after work, around 5:30pm Central time",
      {},
      {}
    );
    
    expect(result.wasUpdated).toBe(true);
    expect(result.user?.timezone).toMatch(/america\/chicago|central/i);
    expect(result.user?.preferredSendHour).toBe(17); // 5:30pm rounds to 5pm/17:00
  });

  it('should not extract vague time references', async () => {
    const result = await testProfileExtraction(
      "I sometimes work out whenever I have time",
      {},
      {}
    );
    
    // Should not extract time preferences from vague statements
    expect(result.user?.timezone).toBeUndefined();
    expect(result.user?.preferredSendHour).toBeUndefined();
  });
});