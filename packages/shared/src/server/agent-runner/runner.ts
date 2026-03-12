/**
 * GymText Agent Runner Factory
 *
 * Creates an agent-runner Runner configured for gymtext:
 * - PostgresStore using DATABASE_URL (ar_ table prefix)
 * - AI SDK model provider (OpenAI + Google)
 * - All gymtext agents registered
 * - All gymtext tools registered
 */
import { createRunner, type Runner } from '@agent-runner/core';
import { PostgresStore } from '@agent-runner/store-postgres';
import { getDatabaseSecrets } from '@/server/config';
import { chatAgent, updateFitnessAgent, getWorkoutAgent, formatWorkoutAgent } from './agents/index.js';
import { registerGymtextTools } from './tools/index.js';

let _runner: Runner | null = null;

/**
 * Create the gymtext Runner instance.
 * Uses DATABASE_URL from environment, shared with gymtext's main DB.
 * Tables are prefixed with ar_ to avoid conflicts.
 */
export function createGymtextRunner(): Runner {
  if (_runner) return _runner;

  const { databaseUrl } = getDatabaseSecrets();

  const store = new PostgresStore({
    connection: databaseUrl,
    tablePrefix: 'ar_',
  });

  const runner = createRunner({
    store,
    session: {
      maxMessages: 30,
      strategy: 'sliding',
    },
  });

  // Register all agents
  runner.registerAgent(chatAgent);
  runner.registerAgent(updateFitnessAgent);
  runner.registerAgent(getWorkoutAgent);
  runner.registerAgent(formatWorkoutAgent);

  // Register all tools
  registerGymtextTools(runner);

  _runner = runner;
  return runner;
}

/**
 * Get the runner instance (creates if needed).
 */
export function getRunner(): Runner {
  return createGymtextRunner();
}
