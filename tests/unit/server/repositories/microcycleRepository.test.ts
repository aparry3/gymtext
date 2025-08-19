import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MicrocycleRepository } from '@/server/repositories/microcycleRepository';
import { DatabaseMockHelper } from '../../../mocks/database-helpers';
import type { Kysely } from 'kysely';
import type { DB } from '@/server/models/_types';

describe('MicrocycleRepository', () => {
  let mockDb: Kysely<DB>;
  let dbHelper: DatabaseMockHelper;
  let microcycleRepository: MicrocycleRepository;

  beforeEach(() => {
    dbHelper = new DatabaseMockHelper();
    mockDb = dbHelper.getDb();
    microcycleRepository = new MicrocycleRepository(mockDb);
  });

  describe('createMicrocycle', () => {
    it('creates a new microcycle with JSON pattern', async () => {
      const newMicrocycle = {
        userId: 'user-1',
        fitnessPlanId: 'plan-1',
        mesocycleIndex: 0,
        weekNumber: 1,
        pattern: {
          weekIndex: 1,
          days: [{ day: 'MONDAY' as const, theme: 'Upper' }],
        },
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-07'),
        isActive: true,
      };

      const dbRow = {
        id: 'micro-1',
        userId: newMicrocycle.userId,
        fitnessPlanId: newMicrocycle.fitnessPlanId,
        mesocycleIndex: newMicrocycle.mesocycleIndex,
        weekNumber: newMicrocycle.weekNumber,
        pattern: JSON.stringify(newMicrocycle.pattern),
        startDate: newMicrocycle.startDate,
        endDate: newMicrocycle.endDate,
        isActive: newMicrocycle.isActive,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      } as any;

      const insertBuilder = dbHelper.mockInsertInto('microcycles');
      insertBuilder.executeTakeFirstOrThrow.mockResolvedValue(dbRow);

      const result = await microcycleRepository.createMicrocycle(newMicrocycle);

      expect(mockDb.insertInto).toHaveBeenCalledWith('microcycles');
      expect(insertBuilder.values).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          fitnessPlanId: 'plan-1',
          mesocycleIndex: 0,
          weekNumber: 1,
          pattern: JSON.stringify(newMicrocycle.pattern),
        })
      );
      expect(result.id).toBe('micro-1');
      expect(result.pattern).toEqual(newMicrocycle.pattern);
      expect(result.isActive).toBe(true);
    });

    it('throws when insert fails', async () => {
      const insertBuilder = dbHelper.mockInsertInto('microcycles');
      insertBuilder.executeTakeFirstOrThrow.mockRejectedValue(new Error('Insert failed'));

      await expect(
        microcycleRepository.createMicrocycle({
          userId: 'user-1',
          fitnessPlanId: 'plan-1',
          mesocycleIndex: 0,
          weekNumber: 1,
          pattern: { weekIndex: 1, days: [] },
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-07'),
          isActive: true,
        })
      ).rejects.toThrow('Insert failed');
    });
  });

  describe('getters', () => {
    it('returns current active microcycle', async () => {
      const selectBuilder = dbHelper.mockSelectFrom('microcycles');
      selectBuilder.executeTakeFirst.mockResolvedValue({
        id: 'micro-1',
        userId: 'user-1',
        fitnessPlanId: 'plan-1',
        mesocycleIndex: 0,
        weekNumber: 1,
        pattern: { weekIndex: 1, days: [] },
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-07'),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const result = await microcycleRepository.getCurrentMicrocycle('user-1');

      expect(mockDb.selectFrom).toHaveBeenCalledWith('microcycles');
      expect(selectBuilder.where).toHaveBeenCalledWith('userId', '=', 'user-1');
      expect(selectBuilder.where).toHaveBeenCalledWith('isActive', '=', true);
      expect(selectBuilder.orderBy).toHaveBeenCalledWith('createdAt', 'desc');
      expect(result?.id).toBe('micro-1');
    });

    it('finds microcycle by week tuple', async () => {
      const selectBuilder = dbHelper.mockSelectFrom('microcycles');
      selectBuilder.executeTakeFirst.mockResolvedValue({ id: 'micro-2' } as any);

      const result = await microcycleRepository.getMicrocycleByWeek('user-1', 'plan-1', 2, 3);

      expect(selectBuilder.where).toHaveBeenCalledWith('userId', '=', 'user-1');
      expect(selectBuilder.where).toHaveBeenCalledWith('fitnessPlanId', '=', 'plan-1');
      expect(selectBuilder.where).toHaveBeenCalledWith('mesocycleIndex', '=', 2);
      expect(selectBuilder.where).toHaveBeenCalledWith('weekNumber', '=', 3);
      expect(result?.id).toBe('micro-2');
    });

    it('gets microcycle by id', async () => {
      const selectBuilder = dbHelper.mockSelectFrom('microcycles');
      selectBuilder.executeTakeFirst.mockResolvedValue({ id: 'micro-1' } as any);

      const result = await microcycleRepository.getMicrocycleById('micro-1');
      expect(selectBuilder.where).toHaveBeenCalledWith('id', '=', 'micro-1');
      expect(result?.id).toBe('micro-1');
    });

    it('lists recent microcycles', async () => {
      const selectBuilder = dbHelper.mockSelectFrom('microcycles');
      selectBuilder.execute.mockResolvedValue([{ id: 'a' }, { id: 'b' }] as any);

      const result = await microcycleRepository.getRecentMicrocycles('user-1', 2);
      expect(selectBuilder.where).toHaveBeenCalledWith('userId', '=', 'user-1');
      expect(selectBuilder.orderBy).toHaveBeenCalledWith('createdAt', 'desc');
      expect(result.map(r => r.id)).toEqual(['a', 'b']);
    });
  });

  describe('updates and deletes', () => {
    it('deactivates previous microcycles for a user', async () => {
      const updateBuilder = dbHelper.mockUpdateTable('microcycles');
      await microcycleRepository.deactivatePreviousMicrocycles('user-1');
      expect(mockDb.updateTable).toHaveBeenCalledWith('microcycles');
      expect(updateBuilder.set).toHaveBeenCalledWith({ isActive: false });
      expect(updateBuilder.where).toHaveBeenCalledWith('userId', '=', 'user-1');
      expect(updateBuilder.where).toHaveBeenCalledWith('isActive', '=', true);
    });

    it('updates allowed fields and returns updated microcycle', async () => {
      const updateBuilder = dbHelper.mockUpdateTable('microcycles');
      updateBuilder.executeTakeFirst.mockResolvedValue({
        id: 'micro-1',
        pattern: JSON.stringify({ weekIndex: 2, days: [] }),
        startDate: new Date('2024-01-08'),
        endDate: new Date('2024-01-14'),
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const result = await microcycleRepository.updateMicrocycle('micro-1', {
        pattern: { weekIndex: 2, days: [] },
        startDate: new Date('2024-01-08'),
        endDate: new Date('2024-01-14'),
        isActive: false,
      });

      expect(mockDb.updateTable).toHaveBeenCalledWith('microcycles');
      expect(updateBuilder.set).toHaveBeenCalledWith(
        expect.objectContaining({
          pattern: JSON.stringify({ weekIndex: 2, days: [] }),
          updatedAt: expect.any(Date),
        })
      );
      expect(updateBuilder.where).toHaveBeenCalledWith('id', '=', 'micro-1');
      expect(result?.isActive).toBe(false);
    });

    it('deletes microcycle by id', async () => {
      const deleteBuilder = dbHelper.mockDeleteFrom('microcycles');
      deleteBuilder.executeTakeFirst.mockResolvedValue({ numDeletedRows: 1 } as any);

      const result = await microcycleRepository.deleteMicrocycle('micro-1');
      expect(mockDb.deleteFrom).toHaveBeenCalledWith('microcycles');
      expect(result).toBe(true);
    });
  });
});