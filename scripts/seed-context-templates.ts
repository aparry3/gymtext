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
      '<User>\n{{#if user.name}}<Name>{{user.name}}</Name>\n{{/if}}{{#if user.gender}}<Gender>{{user.gender}}</Gender>\n{{/if}}{{#if user.age}}<Age>{{user.age}}</Age>\n{{/if}}</User>',
  },
  {
    contextType: 'userProfile',
    template: '<UserProfile>{{content}}</UserProfile>',
  },
  {
    contextType: 'dateContext',
    template:
      '<DateContext>\nToday is {{formattedDate}}.\nTimezone: {{timezone}}\n</DateContext>',
  },
  {
    contextType: 'fitnessPlan',
    template: '<FitnessPlan>{{content}}</FitnessPlan>',
  },
  {
    contextType: 'dayOverview',
    template: '<DayOverview>{{content}}</DayOverview>',
  },
  {
    contextType: 'currentWorkout',
    template:
      '<CurrentWorkout>\n{{#if workout.description}}{{workout.description}}{{else}}{{#if workout.sessionType}}{{workout.sessionType}}{{else}}Workout{{/if}}{{/if}}\n</CurrentWorkout>',
  },
  {
    contextType: 'trainingMeta',
    template:
      '<TrainingMeta>{{#if microcycle.isDeload}}Is Deload Week: {{microcycle.isDeload}}{{/if}}{{#if microcycle.absoluteWeek}} | Absolute Week: {{microcycle.absoluteWeek}}{{/if}}</TrainingMeta>',
  },
  {
    contextType: 'currentMicrocycle',
    template:
      '<CurrentMicrocycle>\nWeek Overview: {{#if microcycle.description}}{{microcycle.description}}{{else}}N/A{{/if}}\nIs Deload: {{microcycle.isDeload}}\nAbsolute Week: {{microcycle.absoluteWeek}}\nDays:\nMonday: {{microcycle.days.0}}\nTuesday: {{microcycle.days.1}}\nWednesday: {{microcycle.days.2}}\nThursday: {{microcycle.days.3}}\nFriday: {{microcycle.days.4}}\nSaturday: {{microcycle.days.5}}\nSunday: {{microcycle.days.6}}\n</CurrentMicrocycle>',
  },
  {
    contextType: 'programVersion',
    template: '<ProgramVersion>\n{{content}}\n</ProgramVersion>',
  },
  {
    contextType: 'availableExercises',
    template:
      '<AvailableExercises>\n{{#each exercises separator="\\n"}}- {{name}}{{/each}}\n</AvailableExercises>',
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
