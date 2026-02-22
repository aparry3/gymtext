/**
 * Main System Data Seed Command
 *
 * Runs all system data seeders in the correct order.
 * Uses upsert operations - safe to run multiple times (idempotent).
 *
 * Usage:
 *   pnpm seed          # Run all system seeders
 *   pnpm seed:agents   # Run only agent seeder
 *   pnpm seed:exercises # Run only exercise seeder
 */

import 'dotenv/config';
import { seedAgents } from './system/agents';
import { seedExercises } from './system/exercises';

const SEEDERS = [
  { name: 'agents', fn: seedAgents },
  { name: 'exercises', fn: seedExercises },
];

async function main() {
  const args = process.argv.slice(2);
  const target = args[0];

  console.log('🌱 Starting system data seed...\n');

  if (target) {
    // Run specific seeder
    const seeder = SEEDERS.find((s) => s.name === target);
    if (!seeder) {
      console.error(`Unknown seeder: ${target}`);
      console.log(`Available seeders: ${SEEDERS.map((s) => s.name).join(', ')}`);
      process.exit(1);
    }
    console.log(`Running ${target} seeder...`);
    await seeder.fn();
    console.log(`✅ ${target} seeder complete`);
  } else {
    // Run all seeders
    for (const seeder of SEEDERS) {
      console.log(`Running ${seeder.name} seeder...`);
      try {
        await seeder.fn();
        console.log(`✅ ${seeder.name} seeder complete\n`);
      } catch (error) {
        console.error(`❌ ${seeder.name} seeder failed:`, error);
        process.exit(1);
      }
    }
    console.log('🎉 All seeders complete!');
  }
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
