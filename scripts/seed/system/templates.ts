/**
 * Seed Context Templates
 *
 * Seeds context_templates table with default templates.
 * Uses upsert - idempotent (safe to run multiple times).
 *
 * Run: pnpm seed:templates
 */

import 'dotenv/config';
import { Pool } from 'pg';

const TEMPLATES = [
  {
    contextType: 'user',
    template: `Client: {{#if user.name}}{{user.name}}{{else}}Unknown{{/if}}{{#if user.gender}} ({{user.gender}}){{/if}}{{#if user.age}}, age {{user.age}}{{/if}}`,
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
    template: `Today's scheduled workout:

{{#if workout.description}}{{workout.description}}{{else}}{{#if workout.sessionType}}{{workout.sessionType}}{{else}}No workout details available{{/if}}{{/if}}`,
  },
  {
    contextType: 'currentMicrocycle',
    template: `This week's training plan (Week {{microcycle.absoluteWeek}}):

{{#if microcycle.description}}{{microcycle.description}}

{{/if}}Monday: {{microcycle.days.0}}
Tuesday: {{microcycle.days.1}}
Wednesday: {{microcycle.days.2}}
Thursday: {{microcycle.days.3}}
Friday: {{microcycle.days.4}}
Saturday: {{microcycle.days.5}}
Sunday: {{microcycle.days.6}}`,
  },
  {
    contextType: 'upcomingMicrocycle',
    template: `Next week's training plan (Week {{microcycle.absoluteWeek}}):

{{#if microcycle.description}}{{microcycle.description}}

{{/if}}Monday: {{microcycle.days.0}}
Tuesday: {{microcycle.days.1}}
Wednesday: {{microcycle.days.2}}
Thursday: {{microcycle.days.3}}
Friday: {{microcycle.days.4}}
Saturday: {{microcycle.days.5}}
Sunday: {{microcycle.days.6}}`,
  },
  {
    contextType: 'programVersion',
    template: 'Program template:\n\n{{content}}',
  },
  {
    contextType: 'programFamily',
    template: 'Program family:\n\n{{content}}',
  },
  {
    contextType: 'recentWorkouts',
    template: 'Recent workouts:\n\n{{content}}',
  },
  {
    contextType: 'trainingHistory',
    template: 'Training history:\n\n{{content}}',
  },
  {
    contextType: 'userPreferences',
    template: 'User preferences:\n\n{{content}}',
  },
  {
    contextType: 'userGoals',
    template: 'User goals:\n\n{{content}}',
  },
  {
    contextType: 'motivation',
    template: '{{content}}',
  },
  {
    contextType: 'injuryHistory',
    template: 'Injury history:\n\n{{content}}',
  },
  {
    contextType: 'equipmentAvailable',
    template: 'Available equipment:\n\n{{content}}',
  },
  {
    contextType: 'constraints',
    template: 'Current constraints:\n\n{{content}}',
  },
  {
    contextType: 'trainingContext',
    template: '{{#if isFirstSession}}This is the user's first session with this program.{{/if}}',
  },
];

export async function seedTemplates(): Promise<void> {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || process.env.SANDBOX_DATABASE_URL,
  });

  try {
    console.log('Seeding context templates...');

    // Check if context_templates table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'context_templates'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('⚠️  context_templates table does not exist. Run migrations first.');
      return;
    }

    for (const { contextType, template } of TEMPLATES) {
      await pool.query(
        `
        INSERT INTO context_templates (context_type, template)
        VALUES ($1, $2)
        ON CONFLICT (context_type, version) DO UPDATE SET
          template = EXCLUDED.template,
          updated_at = NOW()
        `,
        [contextType, template]
      );
      console.log(`  ✓ ${contextType}`);
    }

    console.log(`✅ Seeded ${TEMPLATES.length} context templates`);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  seedTemplates()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
