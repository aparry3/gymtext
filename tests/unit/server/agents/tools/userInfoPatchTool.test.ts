import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userInfoPatchTool } from '@/server/agents/tools/userInfoPatchTool';
import * as session from '@/server/utils/session/onboardingSession';
import { UserRepository } from '@/server/repositories/userRepository';

vi.mock('@/server/repositories/userRepository');

describe('userInfoPatchTool', () => {
  const mockUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (UserRepository as unknown as vi.Mock).mockImplementation(() => ({
      update: mockUpdate,
      findByEmail: vi.fn().mockResolvedValue(undefined),
      findByPhoneNumber: vi.fn().mockResolvedValue(undefined),
    }));
  });

  it('rejects low confidence updates', async () => {
    const res = await userInfoPatchTool.invoke(
      { updates: { name: 'Alice' }, reason: 'user stated name', confidence: 0.4 },
      { configurable: { userId: 'u1' } as any }
    );
    expect(res.applied).toBe(false);
    expect((res as any).reason).toMatch(/Low confidence/);
  });

  it('applies to DB when authed (apply mode)', async () => {
    const res = await userInfoPatchTool.invoke(
      { updates: { name: 'Alice', email: 'a@example.com', phoneNumber: '+15551234567' }, reason: 'from chat', confidence: 0.9 },
      { configurable: { userId: 'u1', mode: 'apply' } as any }
    );

    expect(res.applied).toBe(true);
    expect((res as any).target).toBe('db');
    expect((res as any).fieldsUpdated).toEqual(expect.arrayContaining(['name', 'email', 'phoneNumber']));
    expect(mockUpdate).toHaveBeenCalledWith('u1', {
      name: 'Alice',
      email: 'a@example.com',
      phoneNumber: '+15551234567',
    });
  });

  it('writes to session draft when unauth/intercept', async () => {
    const applyDraftSpy = vi.spyOn(session, 'applyInterceptedUserDraft');

    const res = await userInfoPatchTool.invoke(
      { updates: { name: 'Bob', phone: '(555) 123-4567' }, reason: 'from chat', confidence: 0.8 },
      { configurable: { mode: 'intercept', tempSessionId: 'temp-123' } as any }
    );

    expect(res.applied).toBe(true);
    expect((res as any).target).toBe('session');
    expect((res as any).fieldsUpdated).toEqual(expect.arrayContaining(['name', 'phoneNumber']));
    expect(applyDraftSpy).toHaveBeenCalledWith('temp-123', {
      name: 'Bob',
      phoneNumber: '+5551234567',
    });
  });

  it('ignores invalid email and phone', async () => {
    const res = await userInfoPatchTool.invoke(
      { updates: { email: 'not-an-email', phoneNumber: 'abc' }, reason: 'from chat', confidence: 0.9 },
      { configurable: { userId: 'u1', mode: 'apply' } as any }
    );

    // No valid fields -> not applied
    expect(res.applied).toBe(false);
    expect((res as any).reason).toMatch(/No valid fields/);
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});
