import { Kysely, sql } from 'kysely';

/**
 * Add week:format agent definition
 *
 * Creates a lightweight agent that formats a markdown week dossier
 * into a concise SMS message summarizing the upcoming training week.
 */

export async function up(db: Kysely<unknown>): Promise<void> {
  console.log('Adding week:format agent definition...');

  await sql`
    INSERT INTO agent_definitions (agent_id, system_prompt, model, max_tokens, temperature, description)
    VALUES (
      'week:format',
      ${'You are a fitness coaching assistant. Your job is to take a detailed training week plan (in markdown) and format it into a concise, motivating SMS message.\n\nGuidelines:\n- Keep the message brief and SMS-friendly (under 1500 characters)\n- Summarize each training day with the key focus (e.g., "Mon: Upper Body Push", "Tue: Rest")\n- Include a brief motivating opener\n- Use a clean, easy-to-read format\n- Do not include exercise-level details - just the day-by-day overview\n- If the user has a profile context, personalize the tone\n\nThe user message will contain the full week markdown content. Respond with ONLY the formatted SMS message, nothing else.'},
      'gpt-5-nano',
      2000,
      0.7,
      'Formats a markdown week dossier into an SMS-friendly weekly summary'
    )
  `.execute(db);

  console.log('week:format agent definition added!');
}

export async function down(db: Kysely<unknown>): Promise<void> {
  console.log('Removing week:format agent definition...');

  await sql`
    DELETE FROM agent_definitions WHERE agent_id = 'week:format'
  `.execute(db);

  console.log('week:format agent definition removed!');
}
