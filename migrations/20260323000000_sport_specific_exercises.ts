import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  // 1. Create sports reference table
  await sql`
    CREATE TABLE sports (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      icon TEXT,
      config JSONB DEFAULT '{}',
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `.execute(db);

  // Seed sports
  await sql`
    INSERT INTO sports (slug, name, icon, config) VALUES
      ('general', 'General Fitness', '💪', '{"experience_levels": ["beginner", "intermediate", "advanced"]}'),
      ('basketball', 'Basketball', '🏀', '{
        "positions": ["All", "Point Guard", "Shooting Guard", "Small Forward", "Power Forward", "Center"],
        "skill_levels": ["Beginner", "Intermediate", "Advanced"],
        "session_blocks": ["Warm-Up", "Skill Block", "Game Scenario", "Conditioning", "Cool-Down"]
      }'),
      ('soccer', 'Soccer', '⚽', '{
        "positions": ["All", "Forward", "Midfielder", "Goalkeeper", "Defender"],
        "skill_levels": ["Beginner", "Intermediate", "Advanced"],
        "session_blocks": ["Warm-Up", "Technical Block", "Game Scenario", "Conditioning", "Cool-Down"]
      }')
  `.execute(db);

  // 2. Create tags table (unified tagging)
  await sql`
    CREATE TABLE tags (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      sport_id UUID REFERENCES sports(id),
      slug TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE(slug, sport_id)
    )
  `.execute(db);

  // Partial unique index for global tags (sport_id IS NULL)
  await sql`
    CREATE UNIQUE INDEX idx_tags_global_slug ON tags(slug) WHERE sport_id IS NULL
  `.execute(db);

  await sql`CREATE INDEX idx_tags_sport ON tags(sport_id)`.execute(db);
  await sql`CREATE INDEX idx_tags_category ON tags(category)`.execute(db);

  // 3. Create exercise_tags join table
  await sql`
    CREATE TABLE exercise_tags (
      exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
      tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (exercise_id, tag_id)
    )
  `.execute(db);

  await sql`CREATE INDEX idx_exercise_tags_tag ON exercise_tags(tag_id)`.execute(db);
  await sql`CREATE INDEX idx_exercise_tags_exercise ON exercise_tags(exercise_id)`.execute(db);

  // 4. Add columns to exercises table
  await sql`ALTER TABLE exercises ADD COLUMN sport_id UUID REFERENCES sports(id)`.execute(db);
  await sql`ALTER TABLE exercises ADD COLUMN video_url TEXT`.execute(db);
  await sql`ALTER TABLE exercises ADD COLUMN metadata JSONB DEFAULT '{}'`.execute(db);
  await sql`CREATE INDEX idx_exercises_sport ON exercises(sport_id)`.execute(db);

  // 5. Add columns to programs table
  await sql`ALTER TABLE programs ADD COLUMN sport_id UUID REFERENCES sports(id)`.execute(db);
  await sql`ALTER TABLE programs ADD COLUMN session_structure JSONB`.execute(db);
  await sql`ALTER TABLE programs ADD COLUMN scheduling_enabled BOOLEAN NOT NULL DEFAULT false`.execute(db);
  await sql`ALTER TABLE programs ADD COLUMN scheduling_type TEXT`.execute(db);
  await sql`ALTER TABLE programs ADD COLUMN scheduling_url TEXT`.execute(db);
  await sql`ALTER TABLE programs ADD COLUMN scheduling_notes TEXT`.execute(db);
  await sql`CREATE INDEX idx_programs_sport ON programs(sport_id)`.execute(db);

  // 6. Add columns to program_versions table
  await sql`ALTER TABLE program_versions ADD COLUMN age_group TEXT`.execute(db);
  await sql`ALTER TABLE program_versions ADD COLUMN position_focus TEXT[]`.execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  // Reverse order: remove columns, then drop tables

  // 6. Remove program_versions columns
  await sql`ALTER TABLE program_versions DROP COLUMN IF EXISTS position_focus`.execute(db);
  await sql`ALTER TABLE program_versions DROP COLUMN IF EXISTS age_group`.execute(db);

  // 5. Remove programs columns
  await sql`DROP INDEX IF EXISTS idx_programs_sport`.execute(db);
  await sql`ALTER TABLE programs DROP COLUMN IF EXISTS scheduling_notes`.execute(db);
  await sql`ALTER TABLE programs DROP COLUMN IF EXISTS scheduling_url`.execute(db);
  await sql`ALTER TABLE programs DROP COLUMN IF EXISTS scheduling_type`.execute(db);
  await sql`ALTER TABLE programs DROP COLUMN IF EXISTS scheduling_enabled`.execute(db);
  await sql`ALTER TABLE programs DROP COLUMN IF EXISTS session_structure`.execute(db);
  await sql`ALTER TABLE programs DROP COLUMN IF EXISTS sport_id`.execute(db);

  // 4. Remove exercises columns
  await sql`DROP INDEX IF EXISTS idx_exercises_sport`.execute(db);
  await sql`ALTER TABLE exercises DROP COLUMN IF EXISTS metadata`.execute(db);
  await sql`ALTER TABLE exercises DROP COLUMN IF EXISTS video_url`.execute(db);
  await sql`ALTER TABLE exercises DROP COLUMN IF EXISTS sport_id`.execute(db);

  // 3. Drop exercise_tags
  await sql`DROP TABLE IF EXISTS exercise_tags`.execute(db);

  // 2. Drop tags
  await sql`DROP TABLE IF EXISTS tags`.execute(db);

  // 1. Drop sports
  await sql`DROP TABLE IF EXISTS sports`.execute(db);
}
