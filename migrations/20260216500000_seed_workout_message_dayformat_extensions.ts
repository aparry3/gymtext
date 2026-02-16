import { Kysely, sql } from 'kysely';

/**
 * Seed dayFormat extensions for workout:message agent.
 *
 * These extensions append day-type-specific formatting rules to the
 * workout:message system prompt when the `dayFormat` extension key is
 * passed (TRAINING, ACTIVE_RECOVERY, REST).
 *
 * The prompt content is pulled from the prompts table (seeded in
 * consolidated schema migration 20260117000000).
 */

export async function up(db: Kysely<unknown>): Promise<void> {
  const dayFormatExtensions: Array<{ key: string; promptId: string }> = [
    { key: 'TRAINING', promptId: 'workout:message:format:training' },
    { key: 'ACTIVE_RECOVERY', promptId: 'workout:message:format:active_recovery' },
    { key: 'REST', promptId: 'workout:message:format:rest' },
  ];

  for (const { key, promptId } of dayFormatExtensions) {
    await sql`
      INSERT INTO agent_extensions (
        agent_id, extension_type, extension_key,
        system_prompt, system_prompt_mode,
        description
      )
      SELECT
        'workout:message',
        'dayFormat',
        ${key},
        p.value,
        'append',
        ${'Format rules for ' + key + ' day type messages'}
      FROM (
        SELECT value FROM prompts
        WHERE id = ${promptId} AND role = 'context'
        ORDER BY created_at DESC
        LIMIT 1
      ) p
    `.execute(db);
    console.log(`  Seeded workout:message dayFormat extension: ${key}`);
  }
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await sql`
    DELETE FROM agent_extensions
    WHERE agent_id = 'workout:message'
      AND extension_type = 'dayFormat'
      AND extension_key IN ('TRAINING', 'ACTIVE_RECOVERY', 'REST')
  `.execute(db);
}
