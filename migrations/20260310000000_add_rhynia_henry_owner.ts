import { Kysely, sql } from 'kysely';

/**
 * Add Rhynia Henry as a program owner
 *
 * Creates a program_owner record for Rhynia Henry / Next Level Basketball Training and Development.
 * Landing page: /o/nextlevelbasketball
 */

export async function up(db: Kysely<unknown>): Promise<void> {
  console.log('Adding Rhynia Henry program owner...');

  await sql`
    INSERT INTO program_owners (id, display_name, owner_type, bio, slug, is_active, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      'Rhynia Henry',
      'trainer',
      'AFAA-certified personal trainer, CPR-certified coach, and founder of Next Level Basketball Training and Development. Bolton High and Rhodes College basketball standout. Creator of The FIRE Workout. Developing elite basketball skills at Singleton Community Center and Memphis Jewish Community Center since 2011.',
      'nextlevelbasketball',
      true,
      NOW(),
      NOW()
    )
    ON CONFLICT DO NOTHING
  `.execute(db);

  console.log('Rhynia Henry program owner added!');
}

export async function down(db: Kysely<unknown>): Promise<void> {
  console.log('Removing Rhynia Henry program owner...');

  await sql`
    DELETE FROM program_owners WHERE slug = 'nextlevelbasketball'
  `.execute(db);

  console.log('Rhynia Henry program owner removed!');
}
