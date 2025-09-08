import { describe, it, expect } from 'vitest';
import { testProfileExtraction } from '@/server/agents/profile/chain';

describe('Simple Gender Extraction', () => {
  it('should extract gender from simple comma-separated responses', async () => {
    const result = await testProfileExtraction(
      "Aaron, male, 3392223571, and 5am EST please",
      {},
      {}
    );
    
    expect(result.wasUpdated).toBe(true);
    expect(result.profile?.gender).toBe('male');
    expect(result.updateSummary?.confidence).toBeGreaterThan(0.9);
    
    // Should also extract user info
    expect(result.user?.name).toBe('Aaron');
    expect(result.user?.phoneNumber).toContain('339');
    expect(result.user?.preferredSendHour).toBe(5);
    expect(result.user?.timezone).toBeDefined();
  });

  it('should extract gender from single word responses', async () => {
    const result = await testProfileExtraction(
      "male",
      {},
      { name: 'Test User' }
    );
    
    expect(result.wasUpdated).toBe(true);
    expect(result.profile?.gender).toBe('male');
    expect(result.updateSummary?.confidence).toBeGreaterThan(0.9);
  });

  it('should extract female from comma-separated responses', async () => {
    const result = await testProfileExtraction(
      "Sarah, female, 555-1234, 7am Pacific",
      {},
      {}
    );
    
    expect(result.wasUpdated).toBe(true);
    expect(result.profile?.gender).toBe('female');
    expect(result.user?.name).toBe('Sarah');
  });

  it('should extract non-binary from responses', async () => {
    const result = await testProfileExtraction(
      "Jordan, non-binary, 555-9876, 6pm Eastern",
      {},
      {}
    );
    
    expect(result.wasUpdated).toBe(true);
    expect(result.profile?.gender).toBe('non-binary');
    expect(result.user?.name).toBe('Jordan');
  });

  it('should handle prefer not to say responses', async () => {
    const result = await testProfileExtraction(
      "Alex, prefer not to say, 555-4321, 8am Central",
      {},
      {}
    );
    
    expect(result.wasUpdated).toBe(true);
    expect(result.profile?.gender).toBe('prefer-not-to-say');
    expect(result.user?.name).toBe('Alex');
  });
});