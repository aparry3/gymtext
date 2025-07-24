import { vi } from 'vitest';
import type { Kysely } from 'kysely';
import type { DB } from '@/server/models/_types';
import { createMockDatabase } from './database';

export class DatabaseMockHelper {
  private mockDb: Kysely<DB>;

  constructor(mockDb?: Kysely<DB>) {
    this.mockDb = mockDb || createMockDatabase();
  }

  getDb() {
    return this.mockDb;
  }

  reset() {
    vi.clearAllMocks();
  }

  mockSelectFrom<T extends keyof DB>(table: T) {
    const queryBuilder = {
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

    (this.mockDb.selectFrom as any).mockImplementation((t: string) => {
      if (t === table) {
        return queryBuilder;
      }
      return this.createDefaultSelectQueryBuilder();
    });

    return queryBuilder;
  }

  mockInsertInto<T extends keyof DB>(table: T) {
    const queryBuilder = {
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockReturnThis(),
      returningAll: vi.fn().mockReturnThis(),
      execute: vi.fn().mockResolvedValue([]),
      executeTakeFirst: vi.fn().mockResolvedValue(undefined),
      executeTakeFirstOrThrow: vi.fn().mockRejectedValue(new Error('Insert failed')),
    };

    (this.mockDb.insertInto as any).mockImplementation((t: string) => {
      if (t === table) {
        return queryBuilder;
      }
      return this.createDefaultInsertQueryBuilder();
    });

    return queryBuilder;
  }

  mockUpdateTable<T extends keyof DB>(table: T) {
    const queryBuilder = {
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      whereRef: vi.fn().mockReturnThis(),
      returning: vi.fn().mockReturnThis(),
      returningAll: vi.fn().mockReturnThis(),
      execute: vi.fn().mockResolvedValue([]),
      executeTakeFirst: vi.fn().mockResolvedValue(undefined),
      executeTakeFirstOrThrow: vi.fn().mockRejectedValue(new Error('Update failed')),
    };

    (this.mockDb.updateTable as any).mockImplementation((t: string) => {
      if (t === table) {
        return queryBuilder;
      }
      return this.createDefaultUpdateQueryBuilder();
    });

    return queryBuilder;
  }

  mockDeleteFrom<T extends keyof DB>(table: T) {
    const queryBuilder = {
      where: vi.fn().mockReturnThis(),
      whereRef: vi.fn().mockReturnThis(),
      returning: vi.fn().mockReturnThis(),
      returningAll: vi.fn().mockReturnThis(),
      execute: vi.fn().mockResolvedValue([]),
      executeTakeFirst: vi.fn().mockResolvedValue(undefined),
      executeTakeFirstOrThrow: vi.fn().mockRejectedValue(new Error('Delete failed')),
    };

    (this.mockDb.deleteFrom as any).mockImplementation((t: string) => {
      if (t === table) {
        return queryBuilder;
      }
      return this.createDefaultDeleteQueryBuilder();
    });

    return queryBuilder;
  }

  mockTransaction(callback?: (trx: Kysely<DB>) => Promise<any>) {
    const transactionMock = vi.fn().mockImplementation(async (cb) => {
      if (callback) {
        return callback(this.mockDb);
      }
      return cb(this.mockDb);
    });
    (this.mockDb.transaction as any) = transactionMock;
    return transactionMock;
  }

  private createDefaultSelectQueryBuilder() {
    return {
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
  }

  private createDefaultInsertQueryBuilder() {
    return {
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockReturnThis(),
      returningAll: vi.fn().mockReturnThis(),
      execute: vi.fn().mockResolvedValue([]),
      executeTakeFirst: vi.fn().mockResolvedValue(undefined),
      executeTakeFirstOrThrow: vi.fn().mockRejectedValue(new Error('Insert failed')),
    };
  }

  private createDefaultUpdateQueryBuilder() {
    return {
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      whereRef: vi.fn().mockReturnThis(),
      returning: vi.fn().mockReturnThis(),
      returningAll: vi.fn().mockReturnThis(),
      execute: vi.fn().mockResolvedValue([]),
      executeTakeFirst: vi.fn().mockResolvedValue(undefined),
      executeTakeFirstOrThrow: vi.fn().mockRejectedValue(new Error('Update failed')),
    };
  }

  private createDefaultDeleteQueryBuilder() {
    return {
      where: vi.fn().mockReturnThis(),
      whereRef: vi.fn().mockReturnThis(),
      returning: vi.fn().mockReturnThis(),
      returningAll: vi.fn().mockReturnThis(),
      execute: vi.fn().mockResolvedValue([]),
      executeTakeFirst: vi.fn().mockResolvedValue(undefined),
      executeTakeFirstOrThrow: vi.fn().mockRejectedValue(new Error('Delete failed')),
    };
  }
}