import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getContext } from '@/app/api/profiles/[id]/context/route';
import { POST as postOps, GET as getOps } from '@/app/api/profiles/[id]/ops/route';
import { GET as getHistory } from '@/app/api/profiles/[id]/history/route';
import { FitnessProfileRepository } from '@/server/repositories/fitnessProfileRepository';
import { ProfileUpdateService } from '@/server/services/profileUpdateService';
import { AIContextService } from '@/server/services/aiContextService';
import { FitnessProfile } from '@/server/models/fitnessProfile';

// Mock dependencies
vi.mock('@/server/connections/postgres/postgres', () => ({
  postgresDb: {
    selectFrom: vi.fn().mockReturnThis(),
    selectAll: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    execute: vi.fn(),
  },
}));

vi.mock('@/server/repositories/fitnessProfileRepository');
vi.mock('@/server/services/profileUpdateService');
vi.mock('@/server/services/aiContextService');

describe('Profile API Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/profiles/[id]/context', () => {
    it('should return AI context for a profile', async () => {
      const mockProfile: FitnessProfile = {
        primaryGoal: 'muscle gain',
        experienceLevel: 'intermediate',
        identity: { age: 30, gender: 'male' },
      };

      const mockContext = {
        facts: {
          goals: { primary: 'muscle gain' },
          experience: { level: 'intermediate' },
        },
        prose: 'A 30-year-old male with intermediate experience focusing on muscle gain.',
      };

      vi.mocked(FitnessProfileRepository).mockImplementation(() => ({
        getProfile: vi.fn().mockResolvedValue(mockProfile),
      } as any));

      vi.mocked(AIContextService).mockImplementation(() => ({
        buildAIContext: vi.fn().mockReturnValue(mockContext),
      } as any));

      const request = new NextRequest('http://localhost/api/profiles/user123/context');
      const response = await getContext(request, { params: Promise.resolve({ id: 'user123' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.context).toEqual(mockContext);
      expect(data.profile).toMatchObject({
        primaryGoal: 'muscle gain',
        experienceLevel: 'intermediate',
      });
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(FitnessProfileRepository).mockImplementation(() => ({
        getProfile: vi.fn().mockRejectedValue(new Error('Database error')),
      } as any));

      const request = new NextRequest('http://localhost/api/profiles/user123/context');
      const response = await getContext(request, { params: Promise.resolve({ id: 'user123' }) });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to get profile context');
    });
  });

  describe('POST /api/profiles/[id]/ops', () => {
    it('should apply a patch operation', async () => {
      const updatedProfile: FitnessProfile = {
        primaryGoal: 'strength',
        experienceLevel: 'advanced',
      };

      vi.mocked(ProfileUpdateService).mockImplementation(() => ({
        applyPatch: vi.fn().mockResolvedValue(updatedProfile),
      } as any));

      const request = new NextRequest('http://localhost/api/profiles/user123/ops', {
        method: 'POST',
        body: JSON.stringify({
          patch: { primaryGoal: 'strength' },
          source: 'api',
          metadata: 'User update',
        }),
      });

      const response = await postOps(request, { params: Promise.resolve({ id: 'user123' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.operation).toBe('patch');
      expect(data.profile).toEqual(updatedProfile);
    });

    it('should apply a constraint operation', async () => {
      const updatedProfile: FitnessProfile = {
        constraints: [
          {
            id: '1',
            type: 'injury',
            label: 'Back pain',
            severity: 'moderate',
            status: 'active',
          },
        ],
      };

      vi.mocked(ProfileUpdateService).mockImplementation(() => ({
        applyOp: vi.fn().mockResolvedValue(updatedProfile),
      } as any));

      const request = new NextRequest('http://localhost/api/profiles/user123/ops', {
        method: 'POST',
        body: JSON.stringify({
          op: {
            kind: 'add_constraint',
            constraint: {
              type: 'injury',
              label: 'Back pain',
              severity: 'moderate',
            },
          },
          source: 'sms',
        }),
      });

      const response = await postOps(request, { params: Promise.resolve({ id: 'user123' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.operation).toBe('add_constraint');
      expect(data.profile.constraints).toHaveLength(1);
    });

    it('should validate request format', async () => {
      const request = new NextRequest('http://localhost/api/profiles/user123/ops', {
        method: 'POST',
        body: JSON.stringify({ invalid: 'data' }),
      });

      const response = await postOps(request, { params: Promise.resolve({ id: 'user123' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid request');
    });

    it('should handle validation errors', async () => {
      const request = new NextRequest('http://localhost/api/profiles/user123/ops', {
        method: 'POST',
        body: JSON.stringify({
          op: {
            kind: 'add_constraint',
            constraint: {
              type: 'invalid_type',
              label: 'Test',
            },
          },
        }),
      });

      const response = await postOps(request, { params: Promise.resolve({ id: 'user123' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid request format');
      expect(data.details).toBeDefined();
    });
  });

  describe('GET /api/profiles/[id]/ops', () => {
    it('should return available operations documentation', async () => {
      const request = new NextRequest('http://localhost/api/profiles/user123/ops');
      const response = await getOps();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.availableOperations).toBeDefined();
      expect(data.availableOperations.patch).toBeDefined();
      expect(data.availableOperations.ops).toBeDefined();
      expect(data.availableOperations.ops.add_constraint).toBeDefined();
    });
  });

  describe('GET /api/profiles/[id]/history', () => {
    it('should return profile update history', async () => {
      const mockHistory = [
        {
          id: '1',
          userId: 'user123',
          patch: { primaryGoal: 'muscle gain' },
          source: 'api',
          createdAt: new Date('2024-01-01'),
        },
        {
          id: '2',
          userId: 'user123',
          patch: { experienceLevel: 'intermediate' },
          source: 'sms',
          createdAt: new Date('2024-01-02'),
        },
      ];

      const mockDb = {
        selectFrom: vi.fn().mockReturnThis(),
        selectAll: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue(mockHistory),
      };

      vi.mocked((await import('@/server/connections/postgres/postgres')).postgresDb)
        .selectFrom.mockImplementation(() => mockDb as any);

      const request = new NextRequest('http://localhost/api/profiles/user123/history');
      const response = await getHistory(request, { params: Promise.resolve({ id: 'user123' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.history).toHaveLength(2);
      expect(data.history[0].source).toBe('api');
      expect(data.history[1].source).toBe('sms');
    });

    it('should support pagination', async () => {
      const mockDb = {
        selectFrom: vi.fn().mockReturnThis(),
        selectAll: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue([]),
      };

      vi.mocked((await import('@/server/connections/postgres/postgres')).postgresDb)
        .selectFrom.mockImplementation(() => mockDb as any);

      const request = new NextRequest('http://localhost/api/profiles/user123/history?page=2&limit=10');
      await getHistory(request, { params: Promise.resolve({ id: 'user123' }) });

      expect(mockDb.limit).toHaveBeenCalledWith(10);
      expect(mockDb.offset).toHaveBeenCalledWith(10);
    });

    it('should filter by source', async () => {
      const mockDb = {
        selectFrom: vi.fn().mockReturnThis(),
        selectAll: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue([]),
      };

      vi.mocked((await import('@/server/connections/postgres/postgres')).postgresDb)
        .selectFrom.mockImplementation(() => mockDb as any);

      const request = new NextRequest('http://localhost/api/profiles/user123/history?source=sms');
      await getHistory(request, { params: Promise.resolve({ id: 'user123' }) });

      expect(mockDb.where).toHaveBeenCalledWith('source', '=', 'sms');
    });

    it('should handle errors', async () => {
      vi.mocked((await import('@/server/connections/postgres/postgres')).postgresDb)
        .selectFrom.mockImplementation(() => {
          throw new Error('Database error');
        });

      const request = new NextRequest('http://localhost/api/profiles/user123/history');
      const response = await getHistory(request, { params: Promise.resolve({ id: 'user123' }) });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch profile history');
    });
  });
});