import { Kysely, sql } from 'kysely';
import { Database } from '../src/shared/types/schema';

export async function up(db: Kysely<Database>): Promise<void> {
  // Create workout_programs table
  await db.schema
    .createTable('workout_programs')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('user_id', 'uuid', (col) => col.notNull().references('users.id').onDelete('cascade'))
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('program_type', 'varchar(50)') // 'strength', 'hypertrophy', 'endurance', 'hybrid'
    .addColumn('duration_type', 'varchar(20)') // 'fixed', 'ongoing'
    .addColumn('duration_weeks', 'integer')
    .addColumn('start_date', 'date')
    .addColumn('end_date', 'date')
    .addColumn('status', 'varchar(20)', (col) => col.defaultTo('active')) // 'draft', 'active', 'paused', 'completed'
    .addColumn('goals', 'jsonb')
    .addColumn('equipment_required', 'jsonb')
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .execute();

  // Create program_phases table
  await db.schema
    .createTable('program_phases')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('program_id', 'uuid', (col) => col.notNull().references('workout_programs.id').onDelete('cascade'))
    .addColumn('phase_number', 'integer', (col) => col.notNull())
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('focus', 'varchar(50)') // 'strength', 'volume', 'deload', etc.
    .addColumn('start_week', 'integer', (col) => col.notNull())
    .addColumn('end_week', 'integer', (col) => col.notNull())
    .addColumn('training_variables', 'jsonb') // intensity, volume, frequency guidelines
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .execute();

  // Create program_weeks table
  await db.schema
    .createTable('program_weeks')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('program_id', 'uuid', (col) => col.notNull().references('workout_programs.id').onDelete('cascade'))
    .addColumn('phase_id', 'uuid', (col) => col.references('program_phases.id').onDelete('cascade'))
    .addColumn('week_number', 'integer', (col) => col.notNull())
    .addColumn('name', 'varchar(255)')
    .addColumn('description', 'text')
    .addColumn('weekly_volume_target', 'jsonb')
    .addColumn('training_split', 'jsonb') // defines which body parts/movements each day
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .execute();

  // Create program_sessions table
  await db.schema
    .createTable('program_sessions')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('week_id', 'uuid', (col) => col.notNull().references('program_weeks.id').onDelete('cascade'))
    .addColumn('day_of_week', 'integer', (col) => col.notNull()) // 0-6 (Sunday-Saturday)
    .addColumn('session_type', 'varchar(50)') // 'strength', 'conditioning', 'recovery'
    .addColumn('name', 'varchar(255)')
    .addColumn('description', 'text')
    .addColumn('duration_minutes', 'integer')
    .addColumn('exercises', 'jsonb') // structured exercise data
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .execute();

  // Create user_programs table
  await db.schema
    .createTable('user_programs')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('user_id', 'uuid', (col) => col.notNull().references('users.id').onDelete('cascade'))
    .addColumn('program_id', 'uuid', (col) => col.notNull().references('workout_programs.id').onDelete('cascade'))
    .addColumn('started_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('current_week', 'integer', (col) => col.defaultTo(1))
    .addColumn('current_phase_id', 'uuid', (col) => col.references('program_phases.id'))
    .addColumn('adaptations', 'jsonb') // user-specific modifications
    .addColumn('status', 'varchar(20)', (col) => col.defaultTo('active'))
    .addColumn('completed_at', 'timestamp')
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .execute();

  // Create program_templates table
  await db.schema
    .createTable('program_templates')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('template_data', 'jsonb', (col) => col.notNull()) // full program structure
    .addColumn('category', 'varchar(50)')
    .addColumn('experience_level', 'varchar(20)')
    .addColumn('equipment_required', 'jsonb')
    .addColumn('is_public', 'boolean', (col) => col.defaultTo(false))
    .addColumn('created_by', 'uuid', (col) => col.references('users.id'))
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .execute();

  // Add columns to workouts table to link to programs
  await db.schema
    .alterTable('workouts')
    .addColumn('program_session_id', 'uuid', (col) => col.references('program_sessions.id'))
    .addColumn('user_program_id', 'uuid', (col) => col.references('user_programs.id'))
    .execute();

  // Create indexes for performance
  await db.schema.createIndex('idx_workout_programs_user_id').on('workout_programs').column('user_id').execute();
  await db.schema.createIndex('idx_workout_programs_status').on('workout_programs').column('status').execute();
  await db.schema.createIndex('idx_program_phases_program_id').on('program_phases').column('program_id').execute();
  await db.schema.createIndex('idx_program_weeks_phase_id').on('program_weeks').column('phase_id').execute();
  await db.schema.createIndex('idx_program_sessions_week_id').on('program_sessions').column('week_id').execute();
  await db.schema.createIndex('idx_user_programs_user_id').on('user_programs').column('user_id').execute();
  await db.schema.createIndex('idx_user_programs_status').on('user_programs').column('status').execute();
  await db.schema.createIndex('idx_workouts_user_program_id').on('workouts').column('user_program_id').execute();

  // Create triggers for updated_at timestamps
  await sql`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ language 'plpgsql';
  `.execute(db);

  await sql`
    CREATE TRIGGER update_workout_programs_updated_at BEFORE UPDATE ON workout_programs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  `.execute(db);

  await sql`
    CREATE TRIGGER update_user_programs_updated_at BEFORE UPDATE ON user_programs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  `.execute(db);
}

export async function down(db: Kysely<Database>): Promise<void> {
  // Drop triggers
  await sql`DROP TRIGGER IF EXISTS update_user_programs_updated_at ON user_programs`.execute(db);
  await sql`DROP TRIGGER IF EXISTS update_workout_programs_updated_at ON workout_programs`.execute(db);
  await sql`DROP FUNCTION IF EXISTS update_updated_at_column()`.execute(db);

  // Drop indexes
  await db.schema.dropIndex('idx_workouts_user_program_id').execute();
  await db.schema.dropIndex('idx_user_programs_status').execute();
  await db.schema.dropIndex('idx_user_programs_user_id').execute();
  await db.schema.dropIndex('idx_program_sessions_week_id').execute();
  await db.schema.dropIndex('idx_program_weeks_phase_id').execute();
  await db.schema.dropIndex('idx_program_phases_program_id').execute();
  await db.schema.dropIndex('idx_workout_programs_status').execute();
  await db.schema.dropIndex('idx_workout_programs_user_id').execute();

  // Remove columns from workouts table
  await db.schema
    .alterTable('workouts')
    .dropColumn('program_session_id')
    .dropColumn('user_program_id')
    .execute();

  // Drop tables in reverse order
  await db.schema.dropTable('program_templates').execute();
  await db.schema.dropTable('user_programs').execute();
  await db.schema.dropTable('program_sessions').execute();
  await db.schema.dropTable('program_weeks').execute();
  await db.schema.dropTable('program_phases').execute();
  await db.schema.dropTable('workout_programs').execute();
}