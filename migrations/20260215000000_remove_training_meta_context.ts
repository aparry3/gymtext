import { Kysely, sql } from 'kysely';

/**
 * Remove trainingMeta from agent_definitions.context_types and context_templates.
 *
 * The trainingMeta context provider has been deleted from the codebase.
 * This cleans up any DB references so agents no longer request it.
 */

export async function up(db: Kysely<unknown>): Promise<void> {
  console.log('Removing trainingMeta from agent_definitions context_types...');

  await sql`
    UPDATE agent_definitions
    SET context_types = array_remove(context_types, 'trainingMeta')
    WHERE context_types @> ARRAY['trainingMeta']
  `.execute(db);

  console.log('Removing trainingMeta from context_templates...');

  await sql`
    DELETE FROM context_templates WHERE context_type = 'trainingMeta'
  `.execute(db);

  console.log('Done removing trainingMeta references.');
}

export async function down(db: Kysely<unknown>): Promise<void> {
  console.log('Re-adding trainingMeta context_template row...');

  await sql`
    INSERT INTO context_templates (context_type, template)
    VALUES ('trainingMeta', '<TrainingMeta>{{content}}</TrainingMeta>')
    ON CONFLICT (context_type) DO NOTHING
  `.execute(db);

  console.log('Done. Note: agent_definitions context_types are not restored.');
}
