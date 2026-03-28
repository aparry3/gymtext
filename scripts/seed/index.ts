/**
 * Main System Data Seed Command
 *
 * Runs all system data seeders in the correct order.
 * Uses upsert operations - safe to run multiple times (idempotent).
 *
 * Usage:
 *   pnpm seed              # Show help
 *   pnpm seed --help       # Show help
 *   pnpm seed --all        # Run all seeders
 *   pnpm seed --agents     # Run only agent seeder
 *   pnpm seed --exercises  # Run only exercise seeder
 */

import 'dotenv/config';
import { seedAgents } from './system/agents';
import { seedExercises } from './system/exercises';
import { seedSportPrograms } from './system/sport-programs';

interface SeederEntry {
  name: string;
  flag: string;
  fn: (options?: { overwrite?: boolean }) => Promise<void>;
}

const SEEDERS: SeederEntry[] = [
  { name: 'agents', flag: '--agents', fn: seedAgents },
  { name: 'exercises', flag: '--exercises', fn: seedExercises },
  { name: 'sport-programs', flag: '--sport-programs', fn: seedSportPrograms },
];

function showHelp() {
  console.log(`
🌱 GymText Seed Command

Usage:
  pnpm seed                   # Show help
  pnpm seed --help            # Show help
  pnpm seed --all             # Run all seeders
  pnpm seed --agents          # Run only agent seeder
  pnpm seed --exercises       # Run only exercise seeder
  pnpm seed --sport-programs  # Run only sport programs seeder

Options:
  --overwrite  Overwrite existing entries (inserts new versions for agents)

Examples:
  pnpm seed --all                  # Seed all system data
  pnpm seed --agents               # Seed agent definitions only
  pnpm seed --agents --overwrite   # Re-seed all agents with new versions
  pnpm seed --exercises            # Seed exercises only
  pnpm seed --sport-programs       # Seed sport programs & owners only

Available seeders:
  --agents          Seed agent definitions
  --exercises       Seed exercises
  --sport-programs  Seed sport-specific program owners & programs
  --all             Run all seeders
`);
}

async function main() {
  const args = process.argv.slice(2);

  // Show help if no args, --help, or first arg is unknown
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    showHelp();
    process.exit(0);
  }

  // Parse flags
  const flags = new Set(args);
  const overwrite = flags.has('--overwrite');
  const seedOptions = { overwrite };

  // Check for --all flag
  if (flags.has('--all')) {
    console.log(`🌱 Starting system data seed (all${overwrite ? ', overwrite' : ''})...\n`);
    for (const seeder of SEEDERS) {
      console.log(`Running ${seeder.name} seeder...`);
      try {
        await seeder.fn(seedOptions);
        console.log(`✅ ${seeder.name} seeder complete\n`);
      } catch (error) {
        console.error(`❌ ${seeder.name} seeder failed:`, error);
        process.exit(1);
      }
    }
    console.log('🎉 All seeders complete!');
    return;
  }

  // Run specific seeders based on flags
  const targetSeeders = SEEDERS.filter((s) => flags.has(s.flag));

  if (targetSeeders.length === 0) {
    console.error('No valid seeders specified.');
    console.log('Run "pnpm seed --help" for usage information.');
    process.exit(1);
  }

  console.log(`🌱 Starting system data seed (${targetSeeders.map(s => s.name).join(', ')}${overwrite ? ', overwrite' : ''})...\n`);

  for (const seeder of targetSeeders) {
    console.log(`Running ${seeder.name} seeder...`);
    try {
      await seeder.fn(seedOptions);
      console.log(`✅ ${seeder.name} seeder complete\n`);
    } catch (error) {
      console.error(`❌ ${seeder.name} seeder failed:`, error);
      process.exit(1);
    }
  }

  console.log('🎉 Selected seeders complete!');
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
