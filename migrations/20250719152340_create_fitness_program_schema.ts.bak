import { Kysely, sql } from 'kysely';
import { Database } from '../src/shared/types/database';

export async function up(db: Kysely<Database>): Promise<void> {
  // Create extensions if not exists
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`.execute(db);
  
  // Create or replace the updated_at trigger function
  await sql`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `.execute(db);

  // Create fitness_plans table
  await db.schema
    .createTable('fitness_plans')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('client_id', 'uuid', (col) => col.notNull().references('users.id').onDelete('cascade'))
    .addColumn('program_type', 'varchar(50)', (col) => col.notNull())
    .addColumn('goal_statement', 'text')
    .addColumn('overview', 'text')
    .addColumn('start_date', 'date', (col) => col.notNull())
    .addColumn('macrocycles', 'jsonb', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute();

  // Add check constraint for program_type
  await sql`
    ALTER TABLE fitness_plans 
    ADD CONSTRAINT check_program_type 
    CHECK (program_type IN ('endurance', 'strength', 'shred', 'hybrid', 'rehab', 'other'))
  `.execute(db);

  // Create index for fitness_plans
  await db.schema
    .createIndex('idx_fitness_plans_client')
    .on('fitness_plans')
    .columns(['client_id', 'start_date'])
    .execute();

  // Create trigger for fitness_plans updated_at
  await sql`
    CREATE TRIGGER update_fitness_plans_updated_at
    BEFORE UPDATE ON fitness_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `.execute(db);

  // Create mesocycles table
  await db.schema
    .createTable('mesocycles')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('client_id', 'uuid', (col) => col.notNull().references('users.id').onDelete('cascade'))
    .addColumn('fitness_plan_id', 'uuid', (col) => col.notNull().references('fitness_plans.id').onDelete('cascade'))
    .addColumn('start_date', 'date', (col) => col.notNull())
    .addColumn('cycle_offset', 'integer', (col) => col.notNull())
    .addColumn('phase', 'varchar(255)', (col) => col.notNull())
    .addColumn('length_weeks', 'integer', (col) => col.notNull())
    .addColumn('status', 'varchar(50)', (col) => col.notNull().defaultTo('planned'))
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute();

  // Add check constraints for mesocycles
  await sql`
    ALTER TABLE mesocycles 
    ADD CONSTRAINT check_length_weeks 
    CHECK (length_weeks > 0)
  `.execute(db);

  await sql`
    ALTER TABLE mesocycles 
    ADD CONSTRAINT check_mesocycle_status 
    CHECK (status IN ('planned', 'active', 'completed', 'cancelled'))
  `.execute(db);

  // Create indexes for mesocycles
  await db.schema
    .createIndex('idx_mesocycles_client_active')
    .on('mesocycles')
    .columns(['client_id', 'status', 'start_date'])
    .execute();

  await db.schema
    .createIndex('idx_mesocycles_fitness_plan')
    .on('mesocycles')
    .columns(['fitness_plan_id', 'cycle_offset'])
    .execute();

  // Add unique constraint for mesocycles
  await sql`
    ALTER TABLE mesocycles
    ADD CONSTRAINT unique_mesocycle_plan_offset
    UNIQUE (client_id, fitness_plan_id, cycle_offset)
  `.execute(db);

  // Create trigger for mesocycles updated_at
  await sql`
    CREATE TRIGGER update_mesocycles_updated_at
    BEFORE UPDATE ON mesocycles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `.execute(db);

  // Create microcycles table
  await db.schema
    .createTable('microcycles')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('client_id', 'uuid', (col) => col.notNull().references('users.id').onDelete('cascade'))
    .addColumn('fitness_plan_id', 'uuid', (col) => col.notNull().references('fitness_plans.id').onDelete('cascade'))
    .addColumn('mesocycle_id', 'uuid', (col) => col.notNull().references('mesocycles.id').onDelete('cascade'))
    .addColumn('cycle_offset', 'integer', (col) => col.notNull())
    .addColumn('week_number', 'integer', (col) => col.notNull())
    .addColumn('start_date', 'date', (col) => col.notNull())
    .addColumn('end_date', 'date', (col) => col.notNull())
    .addColumn('targets', 'jsonb')
    .addColumn('actual_metrics', 'jsonb')
    .addColumn('status', 'varchar(50)', (col) => col.notNull().defaultTo('planned'))
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute();

  // Add check constraint for microcycle status
  await sql`
    ALTER TABLE microcycles 
    ADD CONSTRAINT check_microcycle_status 
    CHECK (status IN ('planned', 'active', 'completed', 'cancelled'))
  `.execute(db);

  // Create indexes for microcycles
  await db.schema
    .createIndex('idx_microcycles_client_date')
    .on('microcycles')
    .columns(['client_id', 'start_date'])
    .execute();

  await db.schema
    .createIndex('idx_microcycles_mesocycle')
    .on('microcycles')
    .columns(['mesocycle_id', 'week_number'])
    .execute();

  // Add unique constraint for microcycles
  await sql`
    ALTER TABLE microcycles
    ADD CONSTRAINT unique_microcycle_plan_offset
    UNIQUE (client_id, fitness_plan_id, cycle_offset)
  `.execute(db);

  // Create trigger for microcycles updated_at
  await sql`
    CREATE TRIGGER update_microcycles_updated_at
    BEFORE UPDATE ON microcycles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `.execute(db);

  // Create workout_instances table
  await db.schema
    .createTable('workout_instances')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('client_id', 'uuid', (col) => col.notNull().references('users.id').onDelete('cascade'))
    .addColumn('fitness_plan_id', 'uuid', (col) => col.notNull().references('fitness_plans.id').onDelete('cascade'))
    .addColumn('mesocycle_id', 'uuid', (col) => col.notNull().references('mesocycles.id').onDelete('cascade'))
    .addColumn('microcycle_id', 'uuid', (col) => col.notNull().references('microcycles.id').onDelete('cascade'))
    .addColumn('date', 'date', (col) => col.notNull())
    .addColumn('session_type', 'varchar(50)', (col) => col.notNull())
    .addColumn('status', 'varchar(50)', (col) => col.notNull().defaultTo('scheduled'))
    .addColumn('goal', 'text')
    .addColumn('details', 'jsonb', (col) => col.notNull())
    .addColumn('feedback', 'jsonb')
    .addColumn('metrics', 'jsonb')
    .addColumn('alterations', 'jsonb')
    .addColumn('completed_at', 'timestamptz')
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute();

  // Add check constraints for workout_instances
  await sql`
    ALTER TABLE workout_instances 
    ADD CONSTRAINT check_session_type 
    CHECK (session_type IN ('strength', 'cardio', 'mobility', 'recovery', 'assessment', 'deload'))
  `.execute(db);

  await sql`
    ALTER TABLE workout_instances 
    ADD CONSTRAINT check_workout_status 
    CHECK (status IN ('scheduled', 'sent', 'in_progress', 'completed', 'missed', 'cancelled'))
  `.execute(db);

  // Create indexes for workout_instances
  await db.schema
    .createIndex('idx_workout_instances_daily')
    .on('workout_instances')
    .columns(['client_id', 'date'])
    .execute();

  await db.schema
    .createIndex('idx_workout_instances_date_status')
    .on('workout_instances')
    .columns(['date', 'status'])
    .execute();

  await db.schema
    .createIndex('idx_workout_instances_microcycle')
    .on('workout_instances')
    .columns(['microcycle_id', 'date'])
    .execute();

  // Add unique constraint for workout_instances
  await sql`
    ALTER TABLE workout_instances
    ADD CONSTRAINT unique_workout_instance_daily_session
    UNIQUE (client_id, date, session_type)
  `.execute(db);

  // Create trigger for workout_instances updated_at
  await sql`
    CREATE TRIGGER update_workout_instances_updated_at
    BEFORE UPDATE ON workout_instances
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `.execute(db);
}

export async function down(db: Kysely<Database>): Promise<void> {
  // Drop triggers
  await sql`DROP TRIGGER IF EXISTS update_workout_instances_updated_at ON workout_instances;`.execute(db);
  await sql`DROP TRIGGER IF EXISTS update_microcycles_updated_at ON microcycles;`.execute(db);
  await sql`DROP TRIGGER IF EXISTS update_mesocycles_updated_at ON mesocycles;`.execute(db);
  await sql`DROP TRIGGER IF EXISTS update_fitness_plans_updated_at ON fitness_plans;`.execute(db);

  // Drop indexes for workout_instances
  await db.schema.dropIndex('idx_workout_instances_microcycle').execute();
  await db.schema.dropIndex('idx_workout_instances_date_status').execute();
  await db.schema.dropIndex('idx_workout_instances_daily').execute();

  // Drop indexes for microcycles
  await db.schema.dropIndex('idx_microcycles_mesocycle').execute();
  await db.schema.dropIndex('idx_microcycles_client_date').execute();

  // Drop indexes for mesocycles
  await db.schema.dropIndex('idx_mesocycles_fitness_plan').execute();
  await db.schema.dropIndex('idx_mesocycles_client_active').execute();

  // Drop index for fitness_plans
  await db.schema.dropIndex('idx_fitness_plans_client').execute();

  // Drop tables in reverse order of dependencies
  await db.schema.dropTable('workout_instances').execute();
  await db.schema.dropTable('microcycles').execute();
  await db.schema.dropTable('mesocycles').execute();
  await db.schema.dropTable('fitness_plans').execute();

  // Drop the updated_at function if no other tables are using it
  // Note: We're keeping this function as other tables might be using it
  // await sql`DROP FUNCTION IF EXISTS update_updated_at_column();`.execute(db);
}