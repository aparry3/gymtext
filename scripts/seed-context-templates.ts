/**
 * Seed Context Templates
 *
 * Populates the context_templates table with default Handlebars-style templates
 * for each context type used by the agent system.
 *
 * The table is append-only: new versions are inserted as new rows and the latest
 * row (by created_at) wins. Running this script multiple times is safe — it will
 * insert a fresh set of rows each time.
 *
 * Usage:
 *   pnpm seed:templates
 */

import 'dotenv/config';
import { Pool } from 'pg';

// ─── Templates ───────────────────────────────────────────────────────────────

const TEMPLATES: Array<{ contextType: string; template: string }> = [
  {
    contextType: 'user',
    template:
      'Client: {{#if user.name}}{{user.name}}{{else}}Unknown{{/if}}{{#if user.gender}} ({{user.gender}}){{/if}}{{#if user.age}}, age {{user.age}}{{/if}}',
  },
  {
    contextType: 'userProfile',
    template: 'Here is everything we know about this client:\n\n{{content}}',
  },
  {
    contextType: 'dateContext',
    template: 'Today is {{formattedDate}} ({{timezone}}).',
  },
  {
    contextType: 'fitnessPlan',
    template: 'Their current training program:\n\n{{content}}',
  },
  {
    contextType: 'dayOverview',
    template: "Today's training focus:\n\n{{content}}",
  },
  {
    contextType: 'currentWorkout',
    template:
      "Today's scheduled workout:\n\n{{#if workout.description}}{{workout.description}}{{else}}{{#if workout.sessionType}}{{workout.sessionType}}{{else}}No workout details available{{/if}}{{/if}}",
  },
  {
    contextType: 'currentMicrocycle',
    template:
      "This week's training plan (Week {{microcycle.absoluteWeek}}):\n\n{{#if microcycle.description}}{{microcycle.description}}\n\n{{/if}}Monday: {{microcycle.days.0}}\nTuesday: {{microcycle.days.1}}\nWednesday: {{microcycle.days.2}}\nThursday: {{microcycle.days.3}}\nFriday: {{microcycle.days.4}}\nSaturday: {{microcycle.days.5}}\nSunday: {{microcycle.days.6}}",
  },
  {
    contextType: 'upcomingMicrocycle',
    template:
      "Next week's training plan (Week {{microcycle.absoluteWeek}}):\n\n{{#if microcycle.description}}{{microcycle.description}}\n\n{{/if}}Monday: {{microcycle.days.0}}\nTuesday: {{microcycle.days.1}}\nWednesday: {{microcycle.days.2}}\nThursday: {{microcycle.days.3}}\nFriday: {{microcycle.days.4}}\nSaturday: {{microcycle.days.5}}\nSunday: {{microcycle.days.6}}",
  },
  {
    contextType: 'programVersion',
    template: 'Program template:\n\n{{content}}',
  },
  {
    contextType: 'availableExercises',
    template:
      'Available exercises:\n{{#each exercises separator="\\n"}}- {{name}}{{/each}}',
  },
];

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('Error: DATABASE_URL is not set. Run: source .env.local');
    process.exit(1);
  }

  const pool = new Pool({ connectionString });

  try {
    console.log('Connecting to database...');

    let inserted = 0;

    for (const { contextType, template } of TEMPLATES) {
      await pool.query(
        `INSERT INTO context_templates (context_type, variant, template) VALUES ($1, $2, $3)`,
        [contextType, 'default', template],
      );
      inserted++;
      console.log(`  Seeded: ${contextType}`);
    }

    console.log(`\n--- Summary ---`);
    console.log(`Templates seeded: ${inserted}`);
    console.log('Done!');
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
