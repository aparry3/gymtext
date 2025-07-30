import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BaseRepository } from '@/server/repositories/baseRepository';
import { createMockDatabase } from '../../../mocks/database';
import type { Kysely } from 'kysely';
import type { DB } from '@/server/models/_types';

class TestRepository extends BaseRepository {
  getDb() {
    return this.db;
  }
}

describe('BaseRepository', () => {
  let mockDb: Kysely<DB>;

  beforeEach(() => {
    mockDb = createMockDatabase();
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should use the provided database instance', () => {
      const repo = new TestRepository(mockDb);
      expect(repo.getDb()).toBe(mockDb);
    });

    it('should create repository with custom database instance', () => {
      const customDb = createMockDatabase();
      const repo = new TestRepository(customDb);
      expect(repo.getDb()).toBe(customDb);
      expect(repo.getDb()).not.toBe(mockDb);
    });

    it('should properly inherit db property in subclasses', () => {
      class ChildRepository extends BaseRepository {
        testMethod() {
          return this.db.selectFrom('users');
        }
      }

      const repo = new ChildRepository(mockDb);
      repo.testMethod();
      
      expect(mockDb.selectFrom).toHaveBeenCalledWith('users');
    });
  });

  describe('database operations', () => {
    it('should allow access to database methods', () => {
      const repo = new TestRepository(mockDb);
      const db = repo.getDb();

      expect(db.selectFrom).toBeDefined();
      expect(db.insertInto).toBeDefined();
      expect(db.updateTable).toBeDefined();
      expect(db.deleteFrom).toBeDefined();
      expect(db.transaction).toBeDefined();
    });

    it('should support transaction operations', async () => {
      const repo = new TestRepository(mockDb);
      const db = repo.getDb();

      const transactionCallback = vi.fn().mockResolvedValue('result');
      
      await db.transaction(transactionCallback);

      expect(db.transaction).toHaveBeenCalled();
      expect(db.transaction).toHaveBeenCalledWith(transactionCallback);
    });

    it('should support chained query operations', () => {
      const repo = new TestRepository(mockDb);
      const db = repo.getDb();

      const queryBuilder = db.selectFrom('users');
      queryBuilder.selectAll().where('id', '=', '123').execute();

      expect(mockDb.selectFrom).toHaveBeenCalledWith('users');
    });
  });

  describe('inheritance patterns', () => {
    it('should properly support multiple repository instances with different db connections', () => {
      const mockDb1 = createMockDatabase();
      const mockDb2 = createMockDatabase();

      const repo1 = new TestRepository(mockDb1);
      const repo2 = new TestRepository(mockDb2);

      expect(repo1.getDb()).toBe(mockDb1);
      expect(repo2.getDb()).toBe(mockDb2);
      expect(repo1.getDb()).not.toBe(repo2.getDb());
    });

    it('should maintain separate db instances in concurrent operations', async () => {
      const mockDb1 = createMockDatabase();
      const mockDb2 = createMockDatabase();

      class ConcurrentTestRepository extends BaseRepository {
        async query() {
          return this.db.selectFrom('users').selectAll().execute();
        }
      }

      const repo1 = new ConcurrentTestRepository(mockDb1);
      const repo2 = new ConcurrentTestRepository(mockDb2);

      await Promise.all([
        repo1.query(),
        repo2.query(),
      ]);

      expect(mockDb1.selectFrom).toHaveBeenCalledWith('users');
      expect(mockDb2.selectFrom).toHaveBeenCalledWith('users');
    });

    it('should allow subclasses to expose protected methods', () => {
      class ExtendedRepository extends BaseRepository {
        exposedDb() {
          return this.db;
        }

        async performQuery() {
          return this.db.selectFrom('fitnessProfiles').selectAll().execute();
        }
      }

      const repo = new ExtendedRepository(mockDb);
      expect(repo.exposedDb()).toBe(mockDb);
    });
  });

  describe('error handling', () => {
    it('should propagate database errors', async () => {
      class ErrorTestRepository extends BaseRepository {
        async failingQuery() {
          return this.db.selectFrom('users').selectAll().executeTakeFirstOrThrow();
        }
      }

      const repo = new ErrorTestRepository(mockDb);
      
      await expect(repo.failingQuery()).rejects.toThrow('No results');
    });

    it('should handle transaction rollbacks', async () => {
      const repo = new TestRepository(mockDb);
      const db = repo.getDb();

      const errorMessage = 'Transaction failed';
      const failingCallback = vi.fn().mockRejectedValue(new Error(errorMessage));

      mockDb.transaction = vi.fn().mockImplementation((callback) => {
        return callback(mockDb);
      });

      await expect(
        db.transaction(failingCallback)
      ).rejects.toThrow(errorMessage);
    });

    it('should handle database connection errors', () => {
      const errorDb = {
        selectFrom: vi.fn().mockImplementation(() => {
          throw new Error('Database connection failed');
        }),
      } as any;

      class ConnectionErrorRepository extends BaseRepository {
        query() {
          return this.db.selectFrom('users');
        }
      }

      const repo = new ConnectionErrorRepository(errorDb);
      
      expect(() => repo.query()).toThrow('Database connection failed');
    });
  });

  describe('real-world usage patterns', () => {
    it('should support complex query building', async () => {
      class ComplexRepository extends BaseRepository {
        async findUserWithProfile(userId: string) {
          return this.db
            .selectFrom('users')
            .innerJoin('fitnessProfiles', 'users.id', 'fitnessProfiles.userId')
            .where('users.id', '=', userId)
            .selectAll()
            .executeTakeFirst();
        }
      }

      const repo = new ComplexRepository(mockDb);
      await repo.findUserWithProfile('123');

      expect(mockDb.selectFrom).toHaveBeenCalledWith('users');
      
      const selectFromCall = (mockDb.selectFrom as any).mock.results[0];
      expect(selectFromCall.value.innerJoin).toHaveBeenCalled();
      expect(selectFromCall.value.where).toHaveBeenCalled();
      expect(selectFromCall.value.selectAll).toHaveBeenCalled();
      expect(selectFromCall.value.executeTakeFirst).toHaveBeenCalled();
    });

    it('should support batch operations', async () => {
      class BatchRepository extends BaseRepository {
        async batchInsert(records: any[]) {
          return this.db
            .insertInto('messages')
            .values(records)
            .execute();
        }
      }

      const repo = new BatchRepository(mockDb);
      const records = [
        { content: 'Message 1' },
        { content: 'Message 2' },
      ];

      await repo.batchInsert(records);

      expect(mockDb.insertInto).toHaveBeenCalledWith('messages');
      
      const insertIntoCall = (mockDb.insertInto as any).mock.results[0];
      expect(insertIntoCall.value.values).toHaveBeenCalledWith(records);
      expect(insertIntoCall.value.execute).toHaveBeenCalled();
    });
  });
});