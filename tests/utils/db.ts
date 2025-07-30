import { Kysely, PostgresDialect, CamelCasePlugin, sql } from 'kysely';
import { Pool } from 'pg';
import type { DB } from '@/server/models/_types';
import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

interface TestDatabaseInstance {
  db: Kysely<DB>;
  dbName: string;
  cleanup: () => Promise<void>;
}

class TestDatabaseManager {
  private adminPool: Pool;
  private testDatabases: Map<string, TestDatabaseInstance> = new Map();

  constructor() {
    // Use the test database URL from environment
    const databaseUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/gymtext_test';
    
    // Parse the connection string to get components
    const url = new URL(databaseUrl);
    const [username, password] = url.username ? [url.username, url.password] : ['postgres', 'postgres'];
    
    // Connect to postgres database for admin operations
    this.adminPool = new Pool({
      host: url.hostname,
      port: parseInt(url.port || '5433'),
      user: username,
      password: password,
      database: 'postgres',
      max: 5,
    });
  }

  async createTestDatabase(prefix: string = 'test'): Promise<TestDatabaseInstance> {
    const dbName = `${prefix}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    try {
      // Create the test database
      await this.adminPool.query(`CREATE DATABASE "${dbName}"`);
      
      // Create a new connection pool for the test database
      const baseUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/gymtext_test';
      const url = new URL(baseUrl);
      url.pathname = `/${dbName}`;
      const testDatabaseUrl = url.toString();
      
      const testPool = new Pool({
        connectionString: testDatabaseUrl,
        max: 5,
      });

      // Create Kysely instance for the test database
      const db = new Kysely<DB>({
        dialect: new PostgresDialect({
          pool: testPool,
        }),
        plugins: [new CamelCasePlugin()],
      });

      // Run migrations
      await this.runMigrations(dbName);

      const instance: TestDatabaseInstance = {
        db,
        dbName,
        cleanup: async () => {
          await testPool.end();
          await this.dropDatabase(dbName);
          this.testDatabases.delete(dbName);
        },
      };

      this.testDatabases.set(dbName, instance);
      return instance;
    } catch (error) {
      // Clean up on error
      try {
        await this.dropDatabase(dbName);
      } catch {}
      throw error;
    }
  }

  private async runMigrations(dbName: string): Promise<void> {
    // Get the project root directory
    const projectRoot = path.resolve(__dirname, '../..');
    const migrationsDir = path.join(projectRoot, 'migrations');
    
    // Check if migrations directory exists
    if (!fs.existsSync(migrationsDir)) {
      throw new Error(`Migrations directory not found at ${migrationsDir}`);
    }

    // Set up environment for migration script
    const baseUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/gymtext_test';
    const url = new URL(baseUrl);
    url.pathname = `/${dbName}`;
    const testDatabaseUrl = url.toString();
    
    const env = {
      ...process.env,
      DATABASE_URL: testDatabaseUrl,
    };

    // Run migrations using the project's migration script
    execSync('pnpm migrate:up', {
      cwd: projectRoot,
      env,
      stdio: 'pipe', // Suppress output during tests
    });
  }

  private async dropDatabase(dbName: string): Promise<void> {
    // First, terminate all connections to the database
    await this.adminPool.query(`
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = $1
        AND pid <> pg_backend_pid()
    `, [dbName]);

    // Then drop the database
    await this.adminPool.query(`DROP DATABASE IF EXISTS "${dbName}"`);
  }

  async cleanupAll(): Promise<void> {
    // Clean up all test databases
    const cleanupPromises = Array.from(this.testDatabases.values()).map(
      instance => instance.cleanup()
    );
    await Promise.all(cleanupPromises);
    
    // Close admin pool
    await this.adminPool.end();
  }

  async transaction<T>(
    db: Kysely<DB>,
    callback: (trx: Kysely<DB>) => Promise<T>
  ): Promise<T> {
    return await db.transaction().execute(callback);
  }
}

// Singleton instance
let testDbManager: TestDatabaseManager | null = null;

export function getTestDatabaseManager(): TestDatabaseManager {
  if (!testDbManager) {
    testDbManager = new TestDatabaseManager();
  }
  return testDbManager;
}

// Utility functions for common test scenarios
export async function withTestDatabase<T>(
  callback: (db: Kysely<DB>) => Promise<T>
): Promise<T> {
  const manager = getTestDatabaseManager();
  const { db, cleanup } = await manager.createTestDatabase();
  
  try {
    return await callback(db);
  } finally {
    await cleanup();
  }
}

export async function withTransaction<T>(
  db: Kysely<DB>,
  callback: (trx: Kysely<DB>) => Promise<T>
): Promise<T> {
  const manager = getTestDatabaseManager();
  return await manager.transaction(db, callback);
}

// Helper to truncate all tables (useful for test cleanup)
export async function truncateAllTables(db: Kysely<DB>): Promise<void> {
  const tables = [
    'workout_instances',
    'microcycles',
    'mesocycles',
    'fitness_plans',
    'messages',
    'conversations',
    'fitness_profiles',
    'subscriptions',
    'users',
  ];

  // Disable foreign key checks temporarily
  await sql`SET session_replication_role = 'replica'`.execute(db);
  
  try {
    // Truncate all tables
    for (const table of tables) {
      await sql`TRUNCATE TABLE ${sql.table(table)} CASCADE`.execute(db);
    }
  } finally {
    // Re-enable foreign key checks
    await sql`SET session_replication_role = 'origin'`.execute(db);
  }
}

// Helper to seed test data
export async function seedTestData(db: Kysely<DB>, data: {
  users?: any[];
  fitnessProfiles?: any[];
  fitnessPlans?: any[];
  mesocycles?: any[];
  microcycles?: any[];
  workoutInstances?: any[];
  conversations?: any[];
  messages?: any[];
  subscriptions?: any[];
}): Promise<void> {
  // Insert data in the correct order to respect foreign keys
  if (data.users) {
    await db.insertInto('users').values(data.users).execute();
  }
  
  if (data.fitnessProfiles) {
    await db.insertInto('fitnessProfiles').values(data.fitnessProfiles).execute();
  }
  
  if (data.subscriptions) {
    await db.insertInto('subscriptions').values(data.subscriptions).execute();
  }
  
  if (data.fitnessPlans) {
    await db.insertInto('fitnessPlans').values(data.fitnessPlans).execute();
  }
  
  if (data.mesocycles) {
    await db.insertInto('mesocycles').values(data.mesocycles).execute();
  }
  
  if (data.microcycles) {
    await db.insertInto('microcycles').values(data.microcycles).execute();
  }
  
  if (data.workoutInstances) {
    await db.insertInto('workoutInstances').values(data.workoutInstances).execute();
  }
  
  if (data.conversations) {
    await db.insertInto('conversations').values(data.conversations).execute();
  }
  
  if (data.messages) {
    await db.insertInto('messages').values(data.messages).execute();
  }
}

// Cleanup function to be called in global teardown
export async function cleanupTestDatabases(): Promise<void> {
  if (testDbManager) {
    await testDbManager.cleanupAll();
    testDbManager = null;
  }
}