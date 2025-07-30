import { vi } from 'vitest';
import type { Kysely, SelectQueryBuilder, UpdateQueryBuilder, DeleteQueryBuilder, InsertQueryBuilder } from 'kysely';
import type { DB } from '@/server/models/_types';

export function createMockDatabase(): Kysely<DB> {
  const createSelectQueryBuilder = <T extends keyof DB>(table: T) => {
    const mockSelectQueryBuilder: any = {
      selectAll: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      whereRef: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      offset: vi.fn().mockReturnThis(),
      execute: vi.fn().mockResolvedValue([]),
      executeTakeFirst: vi.fn().mockResolvedValue(undefined),
      executeTakeFirstOrThrow: vi.fn().mockRejectedValue(new Error('No results')),
    };
    return mockSelectQueryBuilder as SelectQueryBuilder<DB, T, {}>;
  };

  const createInsertQueryBuilder = <T extends keyof DB>(table: T) => {
    const mockInsertQueryBuilder: any = {
      values: vi.fn().mockReturnThis(),
      onConflict: vi.fn().mockImplementation((callback) => {
        // Mock the onConflict builder
        const conflictBuilder = {
          columns: vi.fn().mockReturnThis(),
          doUpdateSet: vi.fn().mockReturnThis(),
          doNothing: vi.fn().mockReturnThis(),
        };
        if (callback) callback(conflictBuilder);
        return mockInsertQueryBuilder;
      }),
      returning: vi.fn().mockReturnThis(),
      returningAll: vi.fn().mockReturnThis(),
      execute: vi.fn().mockResolvedValue([]),
      executeTakeFirst: vi.fn().mockResolvedValue(undefined),
      executeTakeFirstOrThrow: vi.fn().mockRejectedValue(new Error('Insert failed')),
    };
    return mockInsertQueryBuilder as InsertQueryBuilder<DB, T, {}>;
  };

  const createUpdateQueryBuilder = <T extends keyof DB>(table: T) => {
    const mockUpdateQueryBuilder: any = {
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      whereRef: vi.fn().mockReturnThis(),
      returning: vi.fn().mockReturnThis(),
      returningAll: vi.fn().mockReturnThis(),
      execute: vi.fn().mockResolvedValue([]),
      executeTakeFirst: vi.fn().mockResolvedValue(undefined),
      executeTakeFirstOrThrow: vi.fn().mockRejectedValue(new Error('Update failed')),
    };
    return mockUpdateQueryBuilder as UpdateQueryBuilder<DB, T, T, {}>;
  };

  const createDeleteQueryBuilder = <T extends keyof DB>(table: T) => {
    const mockDeleteQueryBuilder: any = {
      where: vi.fn().mockReturnThis(),
      whereRef: vi.fn().mockReturnThis(),
      returning: vi.fn().mockReturnThis(),
      returningAll: vi.fn().mockReturnThis(),
      execute: vi.fn().mockResolvedValue([]),
      executeTakeFirst: vi.fn().mockResolvedValue(undefined),
      executeTakeFirstOrThrow: vi.fn().mockRejectedValue(new Error('Delete failed')),
    };
    return mockDeleteQueryBuilder as DeleteQueryBuilder<DB, T, {}>;
  };

  const mockDb: any = {
    selectFrom: vi.fn((table: keyof DB) => createSelectQueryBuilder(table)),
    insertInto: vi.fn((table: keyof DB) => createInsertQueryBuilder(table)),
    updateTable: vi.fn((table: keyof DB) => createUpdateQueryBuilder(table)),
    deleteFrom: vi.fn((table: keyof DB) => createDeleteQueryBuilder(table)),
    transaction: vi.fn().mockImplementation((callback) => callback(mockDb)),
    destroy: vi.fn().mockResolvedValue(undefined),
  };

  return mockDb as Kysely<DB>;
}

export function createMockQueryBuilder<T = any>() {
  const mockQueryBuilder: any = {
    selectAll: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    whereRef: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    onConflict: vi.fn().mockImplementation((callback) => {
      const conflictBuilder = {
        columns: vi.fn().mockReturnThis(),
        doUpdateSet: vi.fn().mockReturnThis(),
        doNothing: vi.fn().mockReturnThis(),
      };
      if (callback) callback(conflictBuilder);
      return mockQueryBuilder;
    }),
    set: vi.fn().mockReturnThis(),
    returning: vi.fn().mockReturnThis(),
    returningAll: vi.fn().mockReturnThis(),
    execute: vi.fn().mockResolvedValue([]),
    executeTakeFirst: vi.fn().mockResolvedValue(undefined),
    executeTakeFirstOrThrow: vi.fn().mockRejectedValue(new Error('No results')),
  };
  return mockQueryBuilder;
}

export function mockDatabaseResponse<T>(mockDb: Kysely<DB>, response: T | T[]) {
  const isArray = Array.isArray(response);
  const queryBuilder = createMockQueryBuilder();
  
  queryBuilder.execute.mockResolvedValue(isArray ? response : [response]);
  queryBuilder.executeTakeFirst.mockResolvedValue(isArray ? response[0] : response);
  queryBuilder.executeTakeFirstOrThrow.mockResolvedValue(isArray ? response[0] : response);
  
  return queryBuilder;
}

export function resetDatabaseMocks(mockDb: Kysely<DB>) {
  vi.clearAllMocks();
}