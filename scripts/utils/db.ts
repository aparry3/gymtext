import { postgresDb } from '@/server/connections/postgres/postgres';
import type { Kysely } from 'kysely';
import type { DB } from '@/server/models/_types';
import chalk from 'chalk';

/**
 * Database utility for test scripts
 * Provides convenient methods for accessing database in tests
 */
export class TestDatabase {
  private _db: Kysely<DB>;
  private static instance: TestDatabase;

  private constructor() {
    this._db = postgresDb;
  }

  /**
   * Get singleton instance
   */
  static getInstance(): TestDatabase {
    if (!TestDatabase.instance) {
      TestDatabase.instance = new TestDatabase();
    }
    return TestDatabase.instance;
  }

  /**
   * Get direct access to Kysely instance
   */
  get db(): Kysely<DB> {
    return this._db;
  }

  /**
   * Get user by phone number
   */
  async getUserByPhone(phone: string) {
    try {
      const user = await this._db
        .selectFrom('users')
        .selectAll()
        .where('phoneNumber', '=', phone)
        .executeTakeFirst();
      
      return user || null;
    } catch (error) {
      console.error(chalk.red('Error fetching user by phone:'), error);
      return null;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string) {
    try {
      const user = await this._db
        .selectFrom('users')
        .selectAll()
        .where('id', '=', id)
        .executeTakeFirst();
      
      return user || null;
    } catch (error) {
      console.error(chalk.red('Error fetching user by ID:'), error);
      return null;
    }
  }

  /**
   * Get user with fitness profile (markdown profile from profiles table)
   */
  async getUserWithProfile(userId: string) {
    try {
      const result = await this._db
        .selectFrom('users')
        .leftJoin('profiles', (join) =>
          join
            .onRef('profiles.clientId', '=', 'users.id')
            .on((eb) => {
              // Only join the most recent profile for this user
              const subquery = eb
                .selectFrom('profiles as p2')
                .select((eb) => eb.fn.max('p2.createdAt').as('maxCreated'))
                .whereRef('p2.clientId', '=', 'users.id');

              return eb('profiles.createdAt', '=', subquery);
            })
        )
        .selectAll('users')
        .select('profiles.profile')
        .where('users.id', '=', userId)
        .executeTakeFirst();

      return result || null;
    } catch (error) {
      console.error(chalk.red('Error fetching user with profile:'), error);
      return null;
    }
  }

  /**
   * Get current fitness plan for user
   */
  async getFitnessPlan(userId: string) {
    try {
      const plan = await this._db
        .selectFrom('fitnessPlans')
        .selectAll()
        .where('clientId', '=', userId)
        .orderBy('createdAt', 'desc')
        .executeTakeFirst();
      
      return plan || null;
    } catch (error) {
      console.error(chalk.red('Error fetching fitness plan:'), error);
      return null;
    }
  }

  /**
   * Get current progress for user
   * NOTE: Progress is now calculated from dates, not stored in DB
   * Use ProgressService.getCurrentProgress() instead
   */
  async getCurrentProgress(userId: string) {
    console.warn('getCurrentProgress is deprecated - use ProgressService.getCurrentProgress() instead');
    return null;
  }

  /**
   * Get current microcycle for user
   */
  async getMicrocycle(userId: string) {
    try {
      const microcycle = await this._db
        .selectFrom('microcycles')
        .selectAll()
        .where('clientId', '=', userId)
        .where('isActive', '=', true)
        .orderBy('createdAt', 'desc')
        .executeTakeFirst();

      return microcycle || null;
    } catch (error) {
      console.error(chalk.red('Error fetching microcycle:'), error);
      return null;
    }
  }

  /**
   * Get recent workouts for user
   */
  async getRecentWorkouts(userId: string, days: number = 7) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const workouts = await this._db
        .selectFrom('workoutInstances')
        .selectAll()
        .where('clientId', '=', userId)
        .where('date', '>=', cutoffDate)
        .orderBy('date', 'desc')
        .execute();
      
      return workouts;
    } catch (error) {
      console.error(chalk.red('Error fetching recent workouts:'), error);
      return [];
    }
  }

  /**
   * Get today's workout for user
   */
  async getTodaysWorkout(userId: string, date?: Date) {
    try {
      const targetDate = date || new Date();
      targetDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(targetDate);
      endDate.setDate(endDate.getDate() + 1);

      const workout = await this._db
        .selectFrom('workoutInstances')
        .selectAll()
        .where('clientId', '=', userId)
        .where('date', '>=', targetDate)
        .where('date', '<', endDate)
        .executeTakeFirst();
      
      return workout || null;
    } catch (error) {
      console.error(chalk.red('Error fetching today\'s workout:'), error);
      return null;
    }
  }

  /**
   * Get all active users
   */
  async getActiveUsers() {
    try {
      const users = await this._db
        .selectFrom('users')
        .innerJoin('subscriptions', 'users.id', 'subscriptions.clientId')
        .selectAll('users')
        .where('subscriptions.status', '=', 'active')
        .execute();

      return users;
    } catch (error) {
      console.error(chalk.red('Error fetching active users:'), error);
      return [];
    }
  }

  /**
   * Get users scheduled for a specific hour
   */
  async getUsersForHour(hour: number) {
    try {
      const users = await this._db
        .selectFrom('users')
        .innerJoin('subscriptions', 'users.id', 'subscriptions.clientId')
        .selectAll('users')
        .where('subscriptions.status', '=', 'active')
        .where('users.preferredSendHour', '=', hour)
        .execute();

      return users;
    } catch (error) {
      console.error(chalk.red('Error fetching users for hour:'), error);
      return [];
    }
  }

  /**
   * Delete user and all related data (for testing cleanup)
   */
  async deleteUser(userId: string) {
    try {
      // Delete in order of dependencies
      await this._db.deleteFrom('workoutInstances').where('clientId', '=', userId).execute();
      await this._db.deleteFrom('microcycles').where('clientId', '=', userId).execute();
      await this._db.deleteFrom('fitnessPlans').where('clientId', '=', userId).execute();
      await this._db.deleteFrom('messages').where('clientId', '=', userId).execute();
      await this._db.deleteFrom('subscriptions').where('clientId', '=', userId).execute();
      // Profile is now stored in users table, no need to delete separately
      await this._db.deleteFrom('users').where('id', '=', userId).execute();

      return true;
    } catch (error) {
      console.error(chalk.red('Error deleting user:'), error);
      return false;
    }
  }

  /**
   * Close database connection
   */
  async close() {
    await this._db.destroy();
  }
}

// Export singleton instance
export const testDb = TestDatabase.getInstance();