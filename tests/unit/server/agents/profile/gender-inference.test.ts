import { describe, it, expect } from 'vitest';
import { testProfileExtraction } from '@/server/agents/profile/chain';
import type { FitnessProfile, User } from '@/server/models/user/schemas';

describe('Profile Agent Gender Inference', () => {
  it('should infer gender from direct statements', async () => {
    const result = await testProfileExtraction(
      "Hi, I'm Sarah and I'm looking to get stronger",
      {},
      { name: 'Sarah' }
    );
    
    expect(result.wasUpdated).toBe(true);
    expect(result.profile?.gender).toBe('female');
    expect(result.updateSummary?.confidence).toBeGreaterThan(0.7);
  });

  it('should infer gender from contextual clues', async () => {
    const result = await testProfileExtraction(
      "As a mother of two, I need workouts I can do at home",
      {},
      {}
    );
    
    expect(result.wasUpdated).toBe(true);
    expect(result.profile?.gender).toBe('female');
    expect(result.updateSummary?.confidence).toBeGreaterThan(0.6);
  });

  it('should handle non-binary identification', async () => {
    const result = await testProfileExtraction(
      "I identify as non-binary and use they/them pronouns",
      {},
      {}
    );
    
    expect(result.wasUpdated).toBe(true);
    expect(result.profile?.gender).toBe('non-binary');
  });

  it('should respect prefer not to say', async () => {
    const result = await testProfileExtraction(
      "I'd prefer not to share my gender information",
      {},
      {}
    );
    
    expect(result.wasUpdated).toBe(true);
    expect(result.profile?.gender).toBe('prefer-not-to-say');
  });

  it('should infer gender from common male names', async () => {
    const result = await testProfileExtraction(
      "My name is Michael and I want to build muscle",
      {},
      { name: 'Michael' }
    );
    
    expect(result.wasUpdated).toBe(true);
    expect(result.profile?.gender).toBe('male');
    expect(result.profile?.primaryGoal).toBe('muscle-gain');
  });

  it('should not infer gender from ambiguous names', async () => {
    const result = await testProfileExtraction(
      "I'm Alex and I want to get in shape",
      {},
      { name: 'Alex' }
    );
    
    // Should update goals but not gender due to ambiguous name
    expect(result.wasUpdated).toBe(true);
    expect(result.profile?.primaryGoal).toBe('general-fitness');
    expect(result.profile?.gender).toBeUndefined();
  });

  it('should handle explicit male identification', async () => {
    const result = await testProfileExtraction(
      "I'm a guy looking to train for a marathon",
      {},
      {}
    );
    
    expect(result.wasUpdated).toBe(true);
    expect(result.profile?.gender).toBe('male');
    expect(result.profile?.primaryGoal).toBe('endurance');
  });
});