/**
 * Fixture Runner
 *
 * Bootstraps a minimal agent runner (DB for agent definitions only)
 * and runs fixtures in isolation with mock tool services.
 */
import './setup';

import { Kysely, PostgresDialect, CamelCasePlugin } from 'kysely';
import { Pool } from 'pg';
import { createRepositories } from '../../../packages/shared/src/server/repositories/factory';
import { createAgentDefinitionService } from '../../../packages/shared/src/server/services/domain/agents/agentDefinitionService';
import { createSimpleAgentRunner } from '../../../packages/shared/src/server/agents/runner/simpleAgentRunner';
import { ToolRegistry } from '../../../packages/shared/src/server/agents/tools/toolRegistry';
import { registerAllTools } from '../../../packages/shared/src/server/agents/tools/definitions';
import { createMockToolServices } from './mockTools';
import type { AgentFixture, FixtureResult } from './types';

type ToolMode = 'mock-tools' | 'no-tools';

interface RunFixtureOptions {
  toolMode: ToolMode;
}

interface RunFixturesResult {
  results: FixtureRunOutput[];
  totalDurationMs: number;
}

export interface FixtureRunOutput {
  fixture: AgentFixture;
  result?: FixtureResult;
  error?: string;
}

let db: Kysely<any> | null = null;

function getDb(): Kysely<any> {
  if (db) return db;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required');
  }
  db = new Kysely<any>({
    dialect: new PostgresDialect({
      pool: new Pool({ connectionString }),
    }),
    plugins: [new CamelCasePlugin()],
  });
  return db;
}

export async function destroyDb(): Promise<void> {
  if (db) {
    await db.destroy();
    db = null;
  }
}

/**
 * Run a single fixture and return the result.
 */
export async function runFixture(
  fixture: AgentFixture,
  options: RunFixtureOptions,
): Promise<FixtureRunOutput> {
  const database = getDb();
  const repos = createRepositories(database);
  const agentDefinitionService = createAgentDefinitionService(repos);

  // Set up tool registry based on mode
  const toolRegistry = new ToolRegistry();
  const mockTools = createMockToolServices(fixture.toolResponses);

  if (options.toolMode === 'mock-tools') {
    registerAllTools(toolRegistry);
  }
  // 'no-tools' mode: leave registry empty

  const agentRunner = createSimpleAgentRunner({
    agentDefinitionService,
    toolRegistry,
    getServices: () => mockTools.services as any,
    agentLogRepository: undefined,
  });

  const startTime = Date.now();

  try {
    const result = await agentRunner.invoke(fixture.agentId, {
      input: fixture.input,
      context: fixture.context,
      params: fixture.params,
      previousMessages: fixture.previousMessages as any,
    });

    const durationMs = Date.now() - startTime;
    const recordedCalls = mockTools.getRecordedCalls();

    // Fetch agent config to get model info
    const config = await agentDefinitionService.getAgentDefinition(fixture.agentId);

    const fixtureResult: FixtureResult = {
      fixtureId: fixture.id,
      agentId: fixture.agentId,
      response: result.response,
      messages: result.messages,
      durationMs,
      model: config.model || 'unknown',
      runAt: new Date().toISOString(),
      toolCalls: recordedCalls.length > 0
        ? recordedCalls.map(c => ({
            name: c.toolName,
            args: (c.args as Record<string, unknown>[]).reduce((acc, a) => ({ ...acc, ...a }), {}),
            timestamp: c.timestamp,
          }))
        : undefined,
    };

    return { fixture, result: fixtureResult };
  } catch (err) {
    return {
      fixture,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Run multiple fixtures sequentially.
 */
export async function runFixtures(
  fixtures: AgentFixture[],
  options: RunFixtureOptions,
): Promise<RunFixturesResult> {
  const totalStart = Date.now();
  const results: FixtureRunOutput[] = [];

  for (const fixture of fixtures) {
    const output = await runFixture(fixture, options);
    results.push(output);
  }

  return {
    results,
    totalDurationMs: Date.now() - totalStart,
  };
}
