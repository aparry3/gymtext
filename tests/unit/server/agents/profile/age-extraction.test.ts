import { describe, it, expect } from 'vitest';
import { testProfileExtraction } from '@/server/agents/profile/chain';

describe('Profile Agent Age Extraction', () => {
  it('should extract explicit age numbers', async () => {
    const result = await testProfileExtraction(
      "Sarah, 28, female, 555-1234, 7am EST",
      {},
      {}
    );
    
    expect(result.wasUpdated).toBe(true);
    expect(result.profile?.age).toBe(28);
    expect(result.profile?.gender).toBe('female');
    expect(result.updateSummary?.confidence).toBeGreaterThan(0.9);
  });

  it('should extract age from direct statements', async () => {
    const result = await testProfileExtraction(
      "I'm 25 and looking to get in shape for my wedding",
      {},
      {}
    );
    
    expect(result.wasUpdated).toBe(true);
    expect(result.profile?.age).toBe(25);
    expect(result.updateSummary?.confidence).toBeGreaterThan(0.9);
  });

  it('should extract age from "years old" format', async () => {
    const result = await testProfileExtraction(
      "I am 32 years old and want to start strength training",
      {},
      {}
    );
    
    expect(result.wasUpdated).toBe(true);
    expect(result.profile?.age).toBe(32);
  });

  it('should handle age ranges with estimation', async () => {
    const result = await testProfileExtraction(
      "I'm in my early thirties and need help with cardio",
      {},
      {}
    );
    
    expect(result.wasUpdated).toBe(true);
    // Should estimate early thirties as around 32
    expect(result.profile?.age).toBeGreaterThanOrEqual(30);
    expect(result.profile?.age).toBeLessThanOrEqual(35);
  });

  it('should extract age from contextual clues', async () => {
    const result = await testProfileExtraction(
      "I just graduated college and want to stay fit",
      {},
      {}
    );
    
    expect(result.wasUpdated).toBe(true);
    // Should estimate college graduate age around 22
    expect(result.profile?.age).toBeGreaterThanOrEqual(20);
    expect(result.profile?.age).toBeLessThanOrEqual(25);
  });

  it('should not extract invalid ages', async () => {
    const result1 = await testProfileExtraction(
      "I'm 5 years old", // too young
      {},
      {}
    );
    
    const result2 = await testProfileExtraction(
      "I'm 150 years old", // too old
      {},
      {}
    );
    
    // Should not extract ages outside valid range
    expect(result1.profile?.age).toBeUndefined();
    expect(result2.profile?.age).toBeUndefined();
  });

  it('should handle comma-separated personal info with age', async () => {
    const result = await testProfileExtraction(
      "John, 35, male, 555-9876",
      {},
      {}
    );
    
    expect(result.wasUpdated).toBe(true);
    expect(result.profile?.age).toBe(35);
    expect(result.profile?.gender).toBe('male');
    expect(result.user?.name).toBe('John');
    expect(result.user?.phoneNumber).toContain('555');
  });

  it('should not extract vague age references', async () => {
    const result = await testProfileExtraction(
      "I feel old and need to get back in shape",
      {},
      {}
    );
    
    // Should not extract age from vague references
    expect(result.profile?.age).toBeUndefined();
  });
});