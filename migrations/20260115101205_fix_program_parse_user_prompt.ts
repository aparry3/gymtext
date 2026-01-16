import { Kysely, sql } from 'kysely';

/**
 * Migration: Fix program parse user prompt format
 *
 * The user prompt should be a preamble that createAgent appends the input to.
 * Remove the {input} placeholder since createAgent doesn't do template substitution.
 */

const FIXED_USER_PROMPT = `Parse the following raw program text into a structured markdown document following the system instructions.

Raw program text to parse:`;

export async function up(db: Kysely<unknown>): Promise<void> {
  console.log('Updating program parse user prompt...');

  await sql`
    INSERT INTO prompts (id, role, value)
    VALUES ('program:parse', 'user', ${FIXED_USER_PROMPT})
  `.execute(db);

  console.log('Program parse user prompt updated');
}

export async function down(db: Kysely<unknown>): Promise<void> {
  // Delete only the newest version (the one we just added)
  // The original version will still exist due to versioning
  await sql`
    DELETE FROM prompts
    WHERE id = 'program:parse'
    AND role = 'user'
    AND value = ${FIXED_USER_PROMPT}
  `.execute(db);

  console.log('Program parse user prompt fix reverted');
}
