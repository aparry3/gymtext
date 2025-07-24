import { describe, it, expect } from 'vitest';
import type { Agent } from '@/server/agents/base';
import type { UserWithProfile } from '@/server/models';

describe('Agent Interface', () => {
  it('should define the correct interface structure', () => {
    // This test verifies that implementations conform to the Agent interface
    const mockAgent: Agent<any> = {
      invoke: async ({ user, context }) => {
        return { user, context };
      },
    };

    expect(mockAgent).toHaveProperty('invoke');
    expect(typeof mockAgent.invoke).toBe('function');
  });

  it('should accept user and context parameters', async () => {
    const mockUser: UserWithProfile = {
      id: 'user-1',
      phoneNumber: '+1234567890',
      name: 'Test User',
      createdAt: new Date(),
      updatedAt: new Date(),
      stripeCustomerId: null,
      notificationTime: null,
      fitnessProfile: null,
    };

    const mockContext = { data: 'test' };

    const mockAgent: Agent<typeof mockContext> = {
      invoke: async ({ user, context }) => {
        expect(user).toBe(mockUser);
        expect(context).toBe(mockContext);
        return { user, context };
      },
    };

    const result = await mockAgent.invoke({ user: mockUser, context: mockContext });
    expect(result.user).toBe(mockUser);
    expect(result.context).toBe(mockContext);
  });

  it('should return user and context in response', async () => {
    const mockUser: UserWithProfile = {
      id: 'user-1',
      phoneNumber: '+1234567890',
      name: 'Test User',
      createdAt: new Date(),
      updatedAt: new Date(),
      stripeCustomerId: null,
      notificationTime: null,
      fitnessProfile: null,
    };

    const mockContext = { message: 'Hello' };

    const testAgent: Agent<typeof mockContext> = {
      invoke: async ({ user, context }) => {
        // Simulate some processing
        const updatedContext = { ...context, processed: true };
        return { user, context: updatedContext };
      },
    };

    const result = await testAgent.invoke({ user: mockUser, context: mockContext });
    
    expect(result).toHaveProperty('user');
    expect(result).toHaveProperty('context');
    expect(result.user).toEqual(mockUser);
    expect(result.context).toHaveProperty('message', 'Hello');
    expect(result.context).toHaveProperty('processed', true);
  });
});