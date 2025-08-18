import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Add profile JSONB column to fitness_profiles table
  await db.schema
    .alterTable('fitness_profiles')
    .addColumn('profile', 'jsonb', (col) => col.defaultTo(sql`'{}'::jsonb`))
    .execute();

  // Add generated columns for commonly accessed fields
  await sql`
    ALTER TABLE fitness_profiles
    ADD COLUMN primary_goal TEXT GENERATED ALWAYS AS (profile->>'primaryGoal') STORED,
    ADD COLUMN experience_level TEXT GENERATED ALWAYS AS (profile->>'experienceLevel') STORED
  `.execute(db);

  // Create profile_updates ledger table
  await db.schema
    .createTable('profile_updates')
    .addColumn('id', 'uuid', (col) => 
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('user_id', 'uuid', (col) => 
      col.references('users.id').onDelete('cascade').notNull()
    )
    .addColumn('patch', 'jsonb', (col) => col.notNull())
    .addColumn('path', 'text')
    .addColumn('source', 'text', (col) => col.notNull())
    .addColumn('reason', 'text')
    .addColumn('created_at', 'timestamptz', (col) => 
      col.notNull().defaultTo(sql`now()`)
    )
    .execute();

  // Create indexes for profile_updates
  await db.schema
    .createIndex('idx_profile_updates_user_id')
    .on('profile_updates')
    .column('user_id')
    .execute();

  await db.schema
    .createIndex('idx_profile_updates_created_at')
    .on('profile_updates')
    .column('created_at')
    .using('btree')
    .execute();

  // Create index on profile JSONB for common queries
  await sql`
    CREATE INDEX idx_fitness_profiles_primary_goal ON fitness_profiles(primary_goal);
    CREATE INDEX idx_fitness_profiles_experience_level ON fitness_profiles(experience_level);
    CREATE INDEX idx_fitness_profiles_profile_gin ON fitness_profiles USING gin(profile);
  `.execute(db);

  // Migrate existing data to JSON format
  await sql`
    UPDATE fitness_profiles 
    SET profile = jsonb_build_object(
      'primaryGoal', fitness_goals,
      'experienceLevel', skill_level,
      'availability', jsonb_build_object(
        'daysPerWeek', CASE 
          WHEN exercise_frequency = 'daily' THEN 7
          WHEN exercise_frequency = '5-6 times a week' THEN 6
          WHEN exercise_frequency = '3-4 times a week' THEN 4
          WHEN exercise_frequency = '1-2 times a week' THEN 2
          ELSE 3
        END
      ),
      'identity', jsonb_build_object(
        'age', age,
        'gender', gender
      ),
      'version', 1
    )
    WHERE profile = '{}'::jsonb
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop indexes
  await sql`
    DROP INDEX IF EXISTS idx_fitness_profiles_primary_goal;
    DROP INDEX IF EXISTS idx_fitness_profiles_experience_level;
    DROP INDEX IF EXISTS idx_fitness_profiles_profile_gin;
  `.execute(db);
  
  await db.schema.dropIndex('idx_profile_updates_created_at').execute();
  await db.schema.dropIndex('idx_profile_updates_user_id').execute();
  
  // Drop profile_updates table
  await db.schema.dropTable('profile_updates').execute();
  
  // Remove generated columns
  await sql`
    ALTER TABLE fitness_profiles
    DROP COLUMN IF EXISTS primary_goal,
    DROP COLUMN IF EXISTS experience_level
  `.execute(db);
  
  // Remove profile column
  await db.schema
    .alterTable('fitness_profiles')
    .dropColumn('profile')
    .execute();
}