import { Kysely, sql } from 'kysely';

const AI_OWNER_ID = '00000000-0000-0000-0000-000000000001';
const AI_PROGRAM_ID = '00000000-0000-0000-0000-000000000002';

export async function up(db: Kysely<any>): Promise<void> {
  // ============================================
  // 1. Create program_owners table
  // ============================================
  console.log('Creating program_owners table...');

  await db.schema
    .createTable('program_owners')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('user_id', 'uuid', (col) => col.references('users.id').onDelete('set null'))
    .addColumn('owner_type', 'varchar(20)', (col) => col.notNull())
    .addColumn('display_name', 'varchar(100)', (col) => col.notNull())
    .addColumn('bio', 'text')
    .addColumn('avatar_url', 'text')
    .addColumn('stripe_connect_account_id', 'varchar(255)')
    .addColumn('is_active', 'boolean', (col) => col.notNull().defaultTo(true))
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute();

  await db.schema
    .createIndex('idx_program_owners_user_id')
    .on('program_owners')
    .column('user_id')
    .execute();

  await db.schema
    .createIndex('idx_program_owners_type')
    .on('program_owners')
    .column('owner_type')
    .execute();

  // ============================================
  // 2. Create programs table
  // ============================================
  console.log('Creating programs table...');

  await db.schema
    .createTable('programs')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('owner_id', 'uuid', (col) => col.notNull().references('program_owners.id').onDelete('cascade'))
    .addColumn('name', 'varchar(200)', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('scheduling_mode', 'varchar(20)', (col) => col.notNull().defaultTo('rolling_start'))
    .addColumn('cadence', 'varchar(30)', (col) => col.notNull().defaultTo('calendar_days'))
    .addColumn('late_joiner_policy', 'varchar(30)', (col) => col.defaultTo('start_from_beginning'))
    .addColumn('billing_model', 'varchar(30)', (col) => col.defaultTo('subscription'))
    .addColumn('revenue_split_percent', 'integer', (col) => col.defaultTo(70))
    .addColumn('is_active', 'boolean', (col) => col.notNull().defaultTo(true))
    .addColumn('is_public', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute();

  await db.schema
    .createIndex('idx_programs_owner_id')
    .on('programs')
    .column('owner_id')
    .execute();

  await db.schema
    .createIndex('idx_programs_active_public')
    .on('programs')
    .columns(['is_active', 'is_public'])
    .execute();

  // ============================================
  // 3. Evolve fitness_plans table
  // ============================================
  console.log('Evolving fitness_plans table...');

  await sql`ALTER TABLE fitness_plans ADD COLUMN program_id UUID REFERENCES programs(id) ON DELETE CASCADE`.execute(db);
  await sql`ALTER TABLE fitness_plans ADD COLUMN published_at TIMESTAMPTZ`.execute(db);

  await db.schema
    .alterTable('fitness_plans')
    .renameColumn('client_id', 'legacy_client_id')
    .execute();

  await db.schema
    .createIndex('idx_fitness_plans_program_id')
    .on('fitness_plans')
    .column('program_id')
    .execute();

  await db.schema
    .createIndex('idx_fitness_plans_published_at')
    .on('fitness_plans')
    .column('published_at')
    .execute();

  // ============================================
  // 4. Create program_enrollments table
  // ============================================
  console.log('Creating program_enrollments table...');

  await db.schema
    .createTable('program_enrollments')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('client_id', 'uuid', (col) => col.notNull().references('users.id').onDelete('cascade'))
    .addColumn('program_id', 'uuid', (col) => col.notNull().references('programs.id').onDelete('cascade'))
    .addColumn('version_id', 'uuid', (col) => col.references('fitness_plans.id').onDelete('set null'))
    .addColumn('cohort_id', 'varchar(100)')
    .addColumn('cohort_start_date', 'date')
    .addColumn('start_date', 'date', (col) => col.notNull())
    .addColumn('current_week', 'integer', (col) => col.notNull().defaultTo(1))
    .addColumn('status', 'varchar(20)', (col) => col.notNull().defaultTo('active'))
    .addColumn('enrolled_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute();

  await db.schema
    .createIndex('idx_enrollments_client_program')
    .on('program_enrollments')
    .columns(['client_id', 'program_id'])
    .unique()
    .execute();

  await db.schema
    .createIndex('idx_enrollments_client_id')
    .on('program_enrollments')
    .column('client_id')
    .execute();

  await db.schema
    .createIndex('idx_enrollments_program_id')
    .on('program_enrollments')
    .column('program_id')
    .execute();

  await db.schema
    .createIndex('idx_enrollments_status')
    .on('program_enrollments')
    .column('status')
    .execute();

  await db.schema
    .createIndex('idx_enrollments_cohort')
    .on('program_enrollments')
    .columns(['program_id', 'cohort_id'])
    .execute();

  // ============================================
  // 5. Seed GymText AI owner and program
  // ============================================
  console.log('Seeding GymText AI owner and program...');

  await sql`
    INSERT INTO program_owners (id, user_id, owner_type, display_name, bio, is_active)
    VALUES (
      ${AI_OWNER_ID}::uuid,
      NULL,
      'ai',
      'GymText AI',
      'Your personal AI fitness coach. Creates customized workout plans based on your goals, experience, and schedule.',
      true
    )
    ON CONFLICT (id) DO NOTHING
  `.execute(db);

  await sql`
    INSERT INTO programs (id, owner_id, name, description, scheduling_mode, cadence, late_joiner_policy, billing_model, is_active, is_public)
    VALUES (
      ${AI_PROGRAM_ID}::uuid,
      ${AI_OWNER_ID}::uuid,
      'AI Personal Training',
      'Personalized fitness plans generated by AI based on your unique profile, goals, and preferences.',
      'rolling_start',
      'calendar_days',
      'start_from_beginning',
      'subscription',
      true,
      true
    )
    ON CONFLICT (id) DO NOTHING
  `.execute(db);

  // ============================================
  // 6. Migrate existing users to enrollments
  // ============================================
  console.log('Migrating existing users to enrollments...');

  await sql`
    WITH latest_plans AS (
      SELECT
        fp.legacy_client_id,
        fp.id as plan_id,
        fp.start_date,
        fp.created_at,
        ROW_NUMBER() OVER (PARTITION BY fp.legacy_client_id ORDER BY fp.created_at DESC) as rn
      FROM fitness_plans fp
      WHERE fp.legacy_client_id IS NOT NULL
    )
    INSERT INTO program_enrollments (client_id, program_id, version_id, start_date, current_week, status, enrolled_at)
    SELECT
      lp.legacy_client_id,
      ${AI_PROGRAM_ID}::uuid,
      lp.plan_id,
      COALESCE(lp.start_date::date, lp.created_at::date),
      GREATEST(1, EXTRACT(WEEK FROM CURRENT_DATE) - EXTRACT(WEEK FROM COALESCE(lp.start_date, lp.created_at)) + 1)::integer,
      'active',
      lp.created_at
    FROM latest_plans lp
    WHERE lp.rn = 1
    AND NOT EXISTS (
      SELECT 1 FROM program_enrollments pe
      WHERE pe.client_id = lp.legacy_client_id
      AND pe.program_id = ${AI_PROGRAM_ID}::uuid
    )
  `.execute(db);

  await sql`
    UPDATE fitness_plans
    SET program_id = ${AI_PROGRAM_ID}::uuid, published_at = created_at
    WHERE legacy_client_id IS NOT NULL AND program_id IS NULL
  `.execute(db);

  const countResult = await sql<{ count: string }>`
    SELECT COUNT(*) as count FROM program_enrollments
  `.execute(db);

  console.log(`Migration complete. Total enrollments: ${countResult.rows[0]?.count || 0}`);
}

export async function down(db: Kysely<any>): Promise<void> {
  // Reverse order of operations

  // 6. Remove migrated enrollments and clear program_id from fitness_plans
  await sql`
    DELETE FROM program_enrollments
    WHERE program_id = ${AI_PROGRAM_ID}::uuid
  `.execute(db);

  await sql`
    UPDATE fitness_plans
    SET program_id = NULL, published_at = NULL
    WHERE program_id = ${AI_PROGRAM_ID}::uuid
  `.execute(db);

  // 5. Remove seeded AI owner and program
  await sql`DELETE FROM programs WHERE id = ${AI_PROGRAM_ID}::uuid`.execute(db);
  await sql`DELETE FROM program_owners WHERE id = ${AI_OWNER_ID}::uuid`.execute(db);

  // 4. Drop program_enrollments table and indexes
  await db.schema.dropIndex('idx_enrollments_cohort').execute();
  await db.schema.dropIndex('idx_enrollments_status').execute();
  await db.schema.dropIndex('idx_enrollments_program_id').execute();
  await db.schema.dropIndex('idx_enrollments_client_id').execute();
  await db.schema.dropIndex('idx_enrollments_client_program').execute();
  await db.schema.dropTable('program_enrollments').execute();

  // 3. Revert fitness_plans changes
  await db.schema.dropIndex('idx_fitness_plans_published_at').execute();
  await db.schema.dropIndex('idx_fitness_plans_program_id').execute();

  await db.schema
    .alterTable('fitness_plans')
    .renameColumn('legacy_client_id', 'client_id')
    .execute();

  await sql`ALTER TABLE fitness_plans DROP COLUMN published_at`.execute(db);
  await sql`ALTER TABLE fitness_plans DROP COLUMN program_id`.execute(db);

  // 2. Drop programs table and indexes
  await db.schema.dropIndex('idx_programs_active_public').execute();
  await db.schema.dropIndex('idx_programs_owner_id').execute();
  await db.schema.dropTable('programs').execute();

  // 1. Drop program_owners table and indexes
  await db.schema.dropIndex('idx_program_owners_type').execute();
  await db.schema.dropIndex('idx_program_owners_user_id').execute();
  await db.schema.dropTable('program_owners').execute();
}
