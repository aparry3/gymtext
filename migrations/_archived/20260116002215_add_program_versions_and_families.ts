import { Kysely, sql } from 'kysely';

const AI_OWNER_ID = '00000000-0000-0000-0000-000000000001';
const AI_PROGRAM_ID = '00000000-0000-0000-0000-000000000002';
const AI_VERSION_ID = '00000000-0000-0000-0000-000000000003';

export async function up(db: Kysely<any>): Promise<void> {
  // ============================================
  // 1. Create program_versions table (the "recipe")
  // ============================================
  console.log('Creating program_versions table...');

  await db.schema
    .createTable('program_versions')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('program_id', 'uuid', (col) => col.notNull().references('programs.id').onDelete('cascade'))
    .addColumn('version_number', 'integer', (col) => col.notNull())
    .addColumn('status', 'varchar(20)', (col) => col.notNull().defaultTo('draft'))
    .addColumn('template_markdown', 'text')
    .addColumn('template_structured', 'jsonb')
    .addColumn('generation_config', 'jsonb')
    .addColumn('default_duration_weeks', 'integer')
    .addColumn('difficulty_metadata', 'jsonb')
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('published_at', 'timestamptz')
    .addColumn('archived_at', 'timestamptz')
    .execute();

  // Unique constraint on program_id + version_number
  await db.schema
    .createIndex('idx_program_versions_program_version')
    .on('program_versions')
    .columns(['program_id', 'version_number'])
    .unique()
    .execute();

  await db.schema
    .createIndex('idx_program_versions_program_id')
    .on('program_versions')
    .column('program_id')
    .execute();

  await db.schema
    .createIndex('idx_program_versions_status')
    .on('program_versions')
    .column('status')
    .execute();

  // ============================================
  // 2. Create program_families table (grouping)
  // ============================================
  console.log('Creating program_families table...');

  await db.schema
    .createTable('program_families')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('owner_id', 'uuid', (col) => col.references('program_owners.id').onDelete('set null'))
    .addColumn('family_type', 'varchar(30)', (col) => col.notNull())
    .addColumn('name', 'varchar(200)', (col) => col.notNull())
    .addColumn('slug', 'varchar(200)', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('visibility', 'varchar(20)', (col) => col.notNull().defaultTo('public'))
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute();

  await db.schema
    .createIndex('idx_program_families_owner_id')
    .on('program_families')
    .column('owner_id')
    .execute();

  await db.schema
    .createIndex('idx_program_families_slug')
    .on('program_families')
    .column('slug')
    .unique()
    .execute();

  await db.schema
    .createIndex('idx_program_families_type')
    .on('program_families')
    .column('family_type')
    .execute();

  // ============================================
  // 3. Create program_family_programs link table
  // ============================================
  console.log('Creating program_family_programs table...');

  await db.schema
    .createTable('program_family_programs')
    .addColumn('family_id', 'uuid', (col) => col.notNull().references('program_families.id').onDelete('cascade'))
    .addColumn('program_id', 'uuid', (col) => col.notNull().references('programs.id').onDelete('cascade'))
    .addColumn('sort_order', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('role', 'varchar(20)')
    .addColumn('pinned', 'boolean', (col) => col.notNull().defaultTo(false))
    .execute();

  // Primary key on (family_id, program_id)
  await sql`
    ALTER TABLE program_family_programs
    ADD CONSTRAINT pk_program_family_programs
    PRIMARY KEY (family_id, program_id)
  `.execute(db);

  // Unique constraint on (family_id, sort_order)
  await db.schema
    .createIndex('idx_program_family_programs_sort')
    .on('program_family_programs')
    .columns(['family_id', 'sort_order'])
    .unique()
    .execute();

  // ============================================
  // 4. Add published_version_id to programs
  // ============================================
  console.log('Adding published_version_id to programs...');

  await sql`ALTER TABLE programs ADD COLUMN published_version_id UUID REFERENCES program_versions(id) ON DELETE SET NULL`.execute(db);

  await db.schema
    .createIndex('idx_programs_published_version')
    .on('programs')
    .column('published_version_id')
    .execute();

  // ============================================
  // 5. Add new columns to fitness_plans (user instances)
  // ============================================
  console.log('Adding new columns to fitness_plans...');

  // client_id - explicit user reference (legacy_client_id is the old name)
  await sql`ALTER TABLE fitness_plans ADD COLUMN client_id UUID REFERENCES users(id) ON DELETE CASCADE`.execute(db);

  // program_version_id - the version this was compiled from
  await sql`ALTER TABLE fitness_plans ADD COLUMN program_version_id UUID REFERENCES program_versions(id) ON DELETE SET NULL`.execute(db);

  // status - active|paused|completed|abandoned
  await sql`ALTER TABLE fitness_plans ADD COLUMN status VARCHAR(20) DEFAULT 'active'`.execute(db);

  // personalization_snapshot - frozen user profile at creation
  await sql`ALTER TABLE fitness_plans ADD COLUMN personalization_snapshot JSONB`.execute(db);

  // current_state - progress tracking
  await sql`ALTER TABLE fitness_plans ADD COLUMN current_state JSONB`.execute(db);

  await db.schema
    .createIndex('idx_fitness_plans_client_id')
    .on('fitness_plans')
    .column('client_id')
    .execute();

  await db.schema
    .createIndex('idx_fitness_plans_program_version_id')
    .on('fitness_plans')
    .column('program_version_id')
    .execute();

  await db.schema
    .createIndex('idx_fitness_plans_status')
    .on('fitness_plans')
    .column('status')
    .execute();

  // ============================================
  // 6. Add program_version_id to program_enrollments
  // ============================================
  console.log('Adding program_version_id to program_enrollments...');

  await sql`ALTER TABLE program_enrollments ADD COLUMN program_version_id UUID REFERENCES program_versions(id) ON DELETE SET NULL`.execute(db);

  await db.schema
    .createIndex('idx_enrollments_program_version_id')
    .on('program_enrollments')
    .column('program_version_id')
    .execute();

  // ============================================
  // 7. Seed AI program version
  // ============================================
  console.log('Seeding AI program version...');

  await sql`
    INSERT INTO program_versions (id, program_id, version_number, status, generation_config, published_at)
    VALUES (
      ${AI_VERSION_ID}::uuid,
      ${AI_PROGRAM_ID}::uuid,
      1,
      'published',
      ${JSON.stringify({
        promptIds: ['generate-fitness-plan', 'generate-microcycle', 'generate-daily-workout'],
        context: {
          emphasis: [],
          constraints: [],
          style: 'personalized'
        }
      })}::jsonb,
      CURRENT_TIMESTAMP
    )
    ON CONFLICT (id) DO NOTHING
  `.execute(db);

  // Update the AI program to point to this version
  await sql`
    UPDATE programs
    SET published_version_id = ${AI_VERSION_ID}::uuid
    WHERE id = ${AI_PROGRAM_ID}::uuid
  `.execute(db);

  // ============================================
  // 8. Data migration: populate new columns
  // ============================================
  console.log('Migrating existing data...');

  // Set client_id from legacy_client_id for all existing fitness_plans
  await sql`
    UPDATE fitness_plans
    SET client_id = legacy_client_id
    WHERE legacy_client_id IS NOT NULL AND client_id IS NULL
  `.execute(db);

  // Set program_version_id for existing AI-generated plans
  await sql`
    UPDATE fitness_plans
    SET program_version_id = ${AI_VERSION_ID}::uuid
    WHERE program_id = ${AI_PROGRAM_ID}::uuid
    AND program_version_id IS NULL
  `.execute(db);

  // Set status = 'active' for existing plans
  await sql`
    UPDATE fitness_plans
    SET status = 'active'
    WHERE status IS NULL
  `.execute(db);

  // Update program_enrollments to use program_version_id
  await sql`
    UPDATE program_enrollments
    SET program_version_id = ${AI_VERSION_ID}::uuid
    WHERE program_id = ${AI_PROGRAM_ID}::uuid
    AND program_version_id IS NULL
  `.execute(db);

  const countResult = await sql<{ count: string }>`
    SELECT COUNT(*) as count FROM program_versions
  `.execute(db);

  console.log(`Migration complete. Total program versions: ${countResult.rows[0]?.count || 0}`);
}

export async function down(db: Kysely<any>): Promise<void> {
  console.log('Rolling back program versions and families...');

  // ============================================
  // 8. Revert data migration
  // ============================================
  await sql`
    UPDATE program_enrollments
    SET program_version_id = NULL
    WHERE program_version_id = ${AI_VERSION_ID}::uuid
  `.execute(db);

  await sql`
    UPDATE fitness_plans
    SET program_version_id = NULL
    WHERE program_version_id = ${AI_VERSION_ID}::uuid
  `.execute(db);

  // ============================================
  // 7. Remove AI program version
  // ============================================
  await sql`
    UPDATE programs
    SET published_version_id = NULL
    WHERE id = ${AI_PROGRAM_ID}::uuid
  `.execute(db);

  await sql`DELETE FROM program_versions WHERE id = ${AI_VERSION_ID}::uuid`.execute(db);

  // ============================================
  // 6. Remove program_version_id from program_enrollments
  // ============================================
  await db.schema.dropIndex('idx_enrollments_program_version_id').execute();
  await sql`ALTER TABLE program_enrollments DROP COLUMN program_version_id`.execute(db);

  // ============================================
  // 5. Remove new columns from fitness_plans
  // ============================================
  await db.schema.dropIndex('idx_fitness_plans_status').execute();
  await db.schema.dropIndex('idx_fitness_plans_program_version_id').execute();
  await db.schema.dropIndex('idx_fitness_plans_client_id').execute();
  await sql`ALTER TABLE fitness_plans DROP COLUMN current_state`.execute(db);
  await sql`ALTER TABLE fitness_plans DROP COLUMN personalization_snapshot`.execute(db);
  await sql`ALTER TABLE fitness_plans DROP COLUMN status`.execute(db);
  await sql`ALTER TABLE fitness_plans DROP COLUMN program_version_id`.execute(db);
  await sql`ALTER TABLE fitness_plans DROP COLUMN client_id`.execute(db);

  // ============================================
  // 4. Remove published_version_id from programs
  // ============================================
  await db.schema.dropIndex('idx_programs_published_version').execute();
  await sql`ALTER TABLE programs DROP COLUMN published_version_id`.execute(db);

  // ============================================
  // 3. Drop program_family_programs table
  // ============================================
  await db.schema.dropIndex('idx_program_family_programs_sort').execute();
  await db.schema.dropTable('program_family_programs').execute();

  // ============================================
  // 2. Drop program_families table
  // ============================================
  await db.schema.dropIndex('idx_program_families_type').execute();
  await db.schema.dropIndex('idx_program_families_slug').execute();
  await db.schema.dropIndex('idx_program_families_owner_id').execute();
  await db.schema.dropTable('program_families').execute();

  // ============================================
  // 1. Drop program_versions table
  // ============================================
  await db.schema.dropIndex('idx_program_versions_status').execute();
  await db.schema.dropIndex('idx_program_versions_program_id').execute();
  await db.schema.dropIndex('idx_program_versions_program_version').execute();
  await db.schema.dropTable('program_versions').execute();

  console.log('Rollback complete');
}
