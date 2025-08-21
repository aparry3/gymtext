import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userInfoPatchTool } from '@/server/agents/tools/userInfoPatchTool';
import { UserRepository } from '@/server/repositories/userRepository';

vi.mock('@/server/repositories/userRepository');

describe('userInfoPatchTool validation & dedupe', () => {
  const mockFindByEmail = vi.fn();
  const mockFindByPhone = vi.fn();
  const mockUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (UserRepository as unknown as vi.Mock).mockImplementation(() => ({
      findByEmail: mockFindByEmail,
      findByPhoneNumber: mockFindByPhone,
      update: mockUpdate,
    }));
  });

  it('blocks duplicate email', async () => {
    mockFindByEmail.mockResolvedValue({ id: 'other-user' });
    const res = await userInfoPatchTool.invoke(
      { updates: { email: 'dupe@example.com' }, reason: 'from chat', confidence: 0.9 },
      { configurable: { userId: 'current' } as any }
    );
    expect(res.applied).toBe(false);
    expect((res as any).conflict).toBe('email');
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('blocks duplicate phoneNumber', async () => {
    mockFindByEmail.mockResolvedValue(undefined);
    mockFindByPhone.mockResolvedValue({ id: 'other-user' });
    const res = await userInfoPatchTool.invoke(
      { updates: { phoneNumber: '+15551234567' }, reason: 'from chat', confidence: 0.9 },
      { configurable: { userId: 'current' } as any }
    );
    expect(res.applied).toBe(false);
    expect((res as any).conflict).toBe('phoneNumber');
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('allows unique contacts and updates', async () => {
    mockFindByEmail.mockResolvedValue(undefined);
    mockFindByPhone.mockResolvedValue(undefined);
    const res = await userInfoPatchTool.invoke(
      { updates: { name: 'Alice', email: 'alice@example.com', phoneNumber: '+15551234567' }, reason: 'from chat', confidence: 0.9 },
      { configurable: { userId: 'u1' } as any }
    );
    expect(res.applied).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith('u1', {
      name: 'Alice',
      email: 'alice@example.com',
      phoneNumber: '+15551234567',
    });
  });
});
