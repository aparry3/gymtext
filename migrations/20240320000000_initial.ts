import { Kysely, sql } from 'kysely';
import { Database } from '../src/db/schema';

export async function up(db: Kysely<Database>): Promise<void> {
  // Create extension for UUID generation
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`.execute(db);

  // Create users table
  await db.schema
    .createTable('users')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('phone_number', 'varchar(20)', (col) => col.notNull().unique())
    .addColumn('email', 'varchar(255)', (col) => col.unique())
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('stripe_customer_id', 'varchar(255)', (col) => col.unique())
    .execute();

  // Create fitness profiles table
  await db.schema
    .createTable('fitness_profiles')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
    .addColumn('user_id', 'uuid', (col) => col.notNull().references('users.id').onDelete('cascade'))
    .addColumn('fitness_goals', 'varchar(255)', (col) => col.notNull())
    .addColumn('skill_level', 'varchar(50)', (col) => col.notNull())
    .addColumn('exercise_frequency', 'varchar(50)', (col) => col.notNull())
    .addColumn('gender', 'varchar(50)', (col) => col.notNull())
    .addColumn('age', 'integer', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute();

  // Create subscriptions table
  await db.schema
    .createTable('subscriptions')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
    .addColumn('user_id', 'uuid', (col) => col.notNull().references('users.id').onDelete('cascade'))
    .addColumn('stripe_subscription_id', 'varchar(255)', (col) => col.notNull().unique())
    .addColumn('status', 'varchar(50)', (col) => col.notNull())
    .addColumn('plan_type', 'varchar(50)', (col) => col.notNull())
    .addColumn('current_period_start', 'timestamptz', (col) => col.notNull())
    .addColumn('current_period_end', 'timestamptz', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('canceled_at', 'timestamptz')
    .execute();

  // Create workouts table
  await db.schema
    .createTable('workouts')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
    .addColumn('user_id', 'uuid', (col) => col.notNull().references('users.id').onDelete('cascade'))
    .addColumn('date', 'date', (col) => col.notNull())
    .addColumn('workout_type', 'varchar(50)', (col) => col.notNull())
    .addColumn('exercises', 'jsonb', (col) => col.notNull())
    .addColumn('sent_at', 'timestamptz')
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute();

  // Create workout logs table
  await db.schema
    .createTable('workout_logs')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
    .addColumn('user_id', 'uuid', (col) => col.notNull().references('users.id').onDelete('cascade'))
    .addColumn('workout_id', 'uuid', (col) => col.notNull().references('workouts.id').onDelete('cascade'))
    .addColumn('completed', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('feedback', 'text')
    .addColumn('rating', 'integer', (col) => col.check(sql`rating >= 1 AND rating <= 5`))
    .addColumn('completed_at', 'timestamptz')
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute();

  // Create indexes
  await db.schema
    .createIndex('idx_users_stripe_customer_id')
    .on('users')
    .column('stripe_customer_id')
    .execute();

  await db.schema
    .createIndex('idx_fitness_profiles_user_id')
    .on('fitness_profiles')
    .column('user_id')
    .execute();

  await db.schema
    .createIndex('idx_subscriptions_user_id')
    .on('subscriptions')
    .column('user_id')
    .execute();

  await db.schema
    .createIndex('idx_subscriptions_stripe_subscription_id')
    .on('subscriptions')
    .column('stripe_subscription_id')
    .execute();

  await db.schema
    .createIndex('idx_workouts_user_id')
    .on('workouts')
    .column('user_id')
    .execute();

  await db.schema
    .createIndex('idx_workouts_date')
    .on('workouts')
    .column('date')
    .execute();

  await db.schema
    .createIndex('idx_workout_logs_user_id')
    .on('workout_logs')
    .column('user_id')
    .execute();

  await db.schema
    .createIndex('idx_workout_logs_workout_id')
    .on('workout_logs')
    .column('workout_id')
    .execute();
}

export async function down(db: Kysely<Database>): Promise<void> {
  // Drop indexes
  await db.schema.dropIndex('idx_workout_logs_workout_id').execute();
  await db.schema.dropIndex('idx_workout_logs_user_id').execute();
  await db.schema.dropIndex('idx_workouts_date').execute();
  await db.schema.dropIndex('idx_workouts_user_id').execute();
  await db.schema.dropIndex('idx_subscriptions_stripe_subscription_id').execute();
  await db.schema.dropIndex('idx_subscriptions_user_id').execute();
  await db.schema.dropIndex('idx_fitness_profiles_user_id').execute();
  await db.schema.dropIndex('idx_users_stripe_customer_id').execute();

  // Drop tables
  await db.schema.dropTable('workout_logs').execute();
  await db.schema.dropTable('workouts').execute();
  await db.schema.dropTable('subscriptions').execute();
  await db.schema.dropTable('fitness_profiles').execute();
  await db.schema.dropTable('users').execute();

  // Drop extension
  await sql`DROP EXTENSION IF EXISTS "uuid-ossp"`.execute(db);
} 