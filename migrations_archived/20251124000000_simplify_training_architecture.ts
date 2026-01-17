import { Kysely, sql } from 'kysely';

/**
 * Simplify training architecture:
 * - Remove mesocycles layer entirely
 * - Simplify fitness_plans (remove programType, goalStatement, notes, mesocycles, lengthWeeks)
 * - Simplify microcycles (replace 7 day columns with days array, add absoluteWeek)
 * - Remove mesocycle_id from workout_instances
 *
 * This is a clean slate migration - all training data is truncated.
 */
export async function up(db: Kysely<any>): Promise<void> {
  // ========================================
  // PHASE 1: Clean slate - truncate training data
  // ========================================
  await sql`TRUNCATE TABLE workout_instances CASCADE`.execute(db);
  await sql`TRUNCATE TABLE microcycles CASCADE`.execute(db);
  await sql`TRUNCATE TABLE mesocycles CASCADE`.execute(db);
  await sql`TRUNCATE TABLE fitness_plans CASCADE`.execute(db);

  // ========================================
  // PHASE 2: Drop mesocycles table
  // ========================================
  // Drop indexes first
  await sql`DROP INDEX IF EXISTS idx_mesocycles_user`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_mesocycles_plan`.execute(db);
  await sql`DROP INDEX IF EXISTS mesocycles_plan_index_unique`.execute(db);

  // Drop table
  await db.schema.dropTable('mesocycles').ifExists().execute();

  // ========================================
  // PHASE 3: Simplify fitness_plans table
  // ========================================
  // Drop program_type check constraint first
  await sql`ALTER TABLE fitness_plans DROP CONSTRAINT IF EXISTS check_program_type`.execute(db);

  // Drop columns that are now captured in description text
  await sql`
    ALTER TABLE fitness_plans
    DROP COLUMN IF EXISTS mesocycles,
    DROP COLUMN IF EXISTS length_weeks,
    DROP COLUMN IF EXISTS goal_statement,
    DROP COLUMN IF EXISTS program_type,
    DROP COLUMN IF EXISTS notes
  `.execute(db);

  // ========================================
  // PHASE 4: Simplify microcycles table
  // ========================================
  // Add new columns
  await sql`
    ALTER TABLE microcycles
    ADD COLUMN absolute_week INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN days TEXT[]
  `.execute(db);

  // Drop old columns
  await sql`
    ALTER TABLE microcycles
    DROP COLUMN IF EXISTS mesocycle_index,
    DROP COLUMN IF EXISTS week_number,
    DROP COLUMN IF EXISTS monday_overview,
    DROP COLUMN IF EXISTS tuesday_overview,
    DROP COLUMN IF EXISTS wednesday_overview,
    DROP COLUMN IF EXISTS thursday_overview,
    DROP COLUMN IF EXISTS friday_overview,
    DROP COLUMN IF EXISTS saturday_overview,
    DROP COLUMN IF EXISTS sunday_overview
  `.execute(db);

  // Add index for absolute_week queries
  await db.schema
    .createIndex('idx_microcycles_absolute_week')
    .on('microcycles')
    .columns(['fitness_plan_id', 'absolute_week'])
    .execute();

  // ========================================
  // PHASE 5: Simplify workout_instances table
  // ========================================
  await sql`
    ALTER TABLE workout_instances
    DROP COLUMN IF EXISTS mesocycle_id
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  // ========================================
  // Restore workout_instances
  // ========================================
  await sql`
    ALTER TABLE workout_instances
    ADD COLUMN mesocycle_id UUID
  `.execute(db);

  // ========================================
  // Restore microcycles
  // ========================================
  // Drop new index
  await sql`DROP INDEX IF EXISTS idx_microcycles_absolute_week`.execute(db);

  // Restore old columns
  await sql`
    ALTER TABLE microcycles
    ADD COLUMN mesocycle_index INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN week_number INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN monday_overview TEXT,
    ADD COLUMN tuesday_overview TEXT,
    ADD COLUMN wednesday_overview TEXT,
    ADD COLUMN thursday_overview TEXT,
    ADD COLUMN friday_overview TEXT,
    ADD COLUMN saturday_overview TEXT,
    ADD COLUMN sunday_overview TEXT
  `.execute(db);

  // Drop new columns
  await sql`
    ALTER TABLE microcycles
    DROP COLUMN IF EXISTS absolute_week,
    DROP COLUMN IF EXISTS days
  `.execute(db);

  // ========================================
  // Restore fitness_plans
  // ========================================
  await sql`
    ALTER TABLE fitness_plans
    ADD COLUMN mesocycles JSON,
    ADD COLUMN length_weeks INTEGER,
    ADD COLUMN goal_statement TEXT,
    ADD COLUMN program_type VARCHAR(50) NOT NULL DEFAULT 'other',
    ADD COLUMN notes TEXT
  `.execute(db);

  // Restore program_type check constraint
  await sql`
    ALTER TABLE fitness_plans
    ADD CONSTRAINT check_program_type
    CHECK (program_type IN ('endurance', 'strength', 'shred', 'hybrid', 'rehab', 'other'))
  `.execute(db);

  // ========================================
  // Restore mesocycles table
  // ========================================
  await db.schema
    .createTable('mesocycles')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('user_id', 'uuid', (col) =>
      col.notNull().references('users.id').onDelete('cascade')
    )
    .addColumn('fitness_plan_id', 'uuid', (col) =>
      col.notNull().references('fitness_plans.id').onDelete('cascade')
    )
    .addColumn('mesocycle_index', 'integer', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('microcycles', sql`text[]`)
    .addColumn('formatted', 'text')
    .addColumn('start_week', 'integer', (col) => col.notNull())
    .addColumn('duration_weeks', 'integer', (col) => col.notNull())
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .execute();

  // Restore indexes
  await db.schema
    .createIndex('mesocycles_plan_index_unique')
    .on('mesocycles')
    .columns(['fitness_plan_id', 'mesocycle_index'])
    .unique()
    .execute();

  await db.schema
    .createIndex('idx_mesocycles_plan')
    .on('mesocycles')
    .column('fitness_plan_id')
    .execute();

  await db.schema
    .createIndex('idx_mesocycles_user')
    .on('mesocycles')
    .column('user_id')
    .execute();
}
