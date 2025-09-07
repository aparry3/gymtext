import { describe, it, expect } from 'vitest';
import { userInfoPatchTool } from '@/server/agents/tools/userInfoPatchTool';
import type { User } from '@/server/models/userModel';

describe('userInfoPatchTool (Phase 4 - Pure Function)', () => {
  it('rejects low confidence updates', async () => {
    const currentUser: Partial<User> = { name: 'Bob' };
    const res = await userInfoPatchTool.invoke({
      currentUser,
      updates: { name: 'Alice' },
      reason: 'user stated name',
      confidence: 0.4
    });

    expect(res.applied).toBe(false);
    expect(res.reason).toMatch(/Low confidence/);
    expect(res.confidence).toBe(0.4);
    expect(res.threshold).toBe(0.75);
    expect(res.updatedUser).toEqual(currentUser); // unchanged
  });

  it('applies valid updates with high confidence', async () => {
    const currentUser: Partial<User> = { name: 'Bob' };
    const updates = { 
      name: 'Alice',
      email: 'alice@example.com',
      phoneNumber: '+13392223571'
    };

    const res = await userInfoPatchTool.invoke({
      currentUser,
      updates,
      reason: 'user provided complete info',
      confidence: 0.9
    });

    expect(res.applied).toBe(true);
    expect(res.updatedUser).toEqual({
      name: 'Alice',
      email: 'alice@example.com', 
      phoneNumber: '+13392223571'
    });
    expect(res.fieldsUpdated).toEqual(['name', 'email', 'phoneNumber']);
    expect(res.confidence).toBe(0.9);
  });

  it('normalizes phone number format', async () => {
    const currentUser: Partial<User> = {};
    const res = await userInfoPatchTool.invoke({
      currentUser,
      updates: { phoneNumber: '3392223571' },
      reason: 'user provided phone',
      confidence: 0.8
    });

    expect(res.applied).toBe(true);
    expect(res.updatedUser.phoneNumber).toBe('+13392223571');
    expect(res.fieldsUpdated).toEqual(['phoneNumber']);
  });

  it('validates and filters invalid email and phone', async () => {
    const currentUser: Partial<User> = { name: 'Bob' };
    const res = await userInfoPatchTool.invoke({
      currentUser,
      updates: { 
        name: 'Alice',
        email: 'not-an-email',
        phoneNumber: 'abc123'
      },
      reason: 'mixed valid/invalid data',
      confidence: 0.9
    });

    expect(res.applied).toBe(true);
    expect(res.updatedUser).toEqual({
      name: 'Alice' // only valid field applied
    });
    expect(res.fieldsUpdated).toEqual(['name']);
  });

  it('handles empty updates gracefully', async () => {
    const currentUser: Partial<User> = { name: 'Bob' };
    const res = await userInfoPatchTool.invoke({
      currentUser,
      updates: { email: 'invalid-email' }, // Invalid email should be filtered out
      reason: 'no valid updates',
      confidence: 0.8
    });

    expect(res.applied).toBe(false);
    expect(res.reason).toMatch(/No valid fields/);
    expect(res.updatedUser).toEqual(currentUser);
    expect(res.fieldsUpdated).toEqual([]);
  });

  it('merges updates with existing user data', async () => {
    const currentUser: Partial<User> = { 
      name: 'Bob',
      email: 'bob@example.com',
      timezone: 'America/New_York'
    };
    
    const res = await userInfoPatchTool.invoke({
      currentUser,
      updates: { name: 'Robert' }, // only update name
      reason: 'user corrected name',
      confidence: 0.95
    });

    expect(res.applied).toBe(true);
    expect(res.updatedUser).toEqual({
      name: 'Robert', // updated
      email: 'bob@example.com', // preserved
      timezone: 'America/New_York' // preserved
    });
    expect(res.fieldsUpdated).toEqual(['name']);
  });
});
