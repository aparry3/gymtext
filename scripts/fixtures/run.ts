#!/usr/bin/env tsx
/**
 * Fixture Runner CLI
 *
 * Run agent fixtures in isolation to test agent behavior without
 * the full application stack.
 *
 * Usage:
 *   pnpm fixture:run path/to/fixture.json
 *   pnpm fixture:run --agent workout:details
 *   pnpm fixture:run --persona sarah-chen
 *   pnpm fixture:run --all
 *   pnpm fixture:run --agent plan:generate --save
 *   pnpm fixture:run --agent chat:generate --no-tools
 */
import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import {
  loadFixture,
  loadFixturesByAgent,
  loadFixturesByPersona,
  loadAllFixtures,
  listFixtures,
  agentIdToDir,
} from './lib/loader';
import { runFixtures, destroyDb } from './lib/runner';
import type { AgentFixture, FixtureResult } from './lib/types';
import type { FixtureRunOutput } from './lib/runner';

const program = new Command();

program
  .name('fixture:run')
  .description('Run agent fixtures in isolation')
  .argument('[file]', 'Path to a specific fixture file')
  .option('--agent <agentId>', 'Run all fixtures for an agent')
  .option('--persona <persona>', 'Run all fixtures for a persona')
  .option('--all', 'Run all fixtures')
  .option('--save', 'Save results to .result.json files')
  .option('--no-tools', 'Strip tools from agent (empty registry)')
  .option('--mock-tools', 'Use mock tools (default behavior)')
  .option('--list', 'List available fixtures')
  .action(async (file, opts) => {
    try {
      // List mode
      if (opts.list) {
        const fixtures = listFixtures();
        if (fixtures.length === 0) {
          console.log('No fixtures found. Create fixtures in scripts/fixtures/agents/');
          return;
        }
        console.log(`\nFound ${fixtures.length} fixture(s):\n`);
        for (const f of fixtures) {
          console.log(`  ${f.id} (${f.agentId}) [${f.persona}]`);
          console.log(`    ${f.path}`);
        }
        console.log();
        return;
      }

      // Resolve fixtures to run
      let fixtures: AgentFixture[] = [];

      if (file) {
        const absPath = path.resolve(file);
        fixtures = [loadFixture(absPath)];
      } else if (opts.agent) {
        fixtures = loadFixturesByAgent(opts.agent);
      } else if (opts.persona) {
        fixtures = loadFixturesByPersona(opts.persona);
      } else if (opts.all) {
        fixtures = loadAllFixtures();
      } else {
        program.help();
        return;
      }

      if (fixtures.length === 0) {
        console.log('\nNo fixtures found matching the criteria.');
        if (opts.agent) {
          console.log(`  Looked for agent: ${opts.agent}`);
          console.log(`  Expected directory: scripts/fixtures/agents/${agentIdToDir(opts.agent)}/`);
        }
        if (opts.persona) {
          console.log(`  Looked for persona: ${opts.persona}`);
        }
        console.log('\nRun with --list to see available fixtures.');
        return;
      }

      // Determine tool mode
      const toolMode = opts.tools === false ? 'no-tools' as const : 'mock-tools' as const;

      console.log(`\nRunning ${fixtures.length} fixture(s) [tools: ${toolMode}]\n`);

      // Run fixtures
      const { results, totalDurationMs } = await runFixtures(fixtures, { toolMode });

      // Print results
      for (const output of results) {
        printResult(output);
      }

      // Summary
      const passed = results.filter(r => r.result).length;
      const failed = results.filter(r => r.error).length;
      console.log('━'.repeat(50));
      console.log(`\nSummary: ${passed} passed, ${failed} failed, ${totalDurationMs}ms total\n`);

      // Save results if requested
      if (opts.save) {
        for (const output of results) {
          if (output.result) {
            saveResult(output.fixture, output.result);
          }
        }
        console.log(`Results saved to scripts/fixtures/agents/*/\n`);
      }
    } catch (err) {
      console.error('\nError:', err instanceof Error ? err.message : err);
      process.exit(1);
    } finally {
      await destroyDb();
    }
  });

function printResult(output: FixtureRunOutput): void {
  const { fixture } = output;
  console.log('━'.repeat(50));
  console.log(`Fixture: ${fixture.id} (${fixture.agentId})`);
  console.log('━'.repeat(50));

  if (output.error) {
    console.log(`  Status: FAILED`);
    console.log(`  Error: ${output.error}`);
    console.log();
    return;
  }

  const result = output.result!;
  const preview = result.response.substring(0, 200);
  const truncated = result.response.length > 200 ? '...' : '';

  console.log(`  Duration: ${result.durationMs}ms`);
  console.log(`  Response length: ${result.response.length} chars`);
  console.log(`  Response preview:`);
  for (const line of preview.split('\n').slice(0, 8)) {
    console.log(`    ${line}`);
  }
  if (truncated) console.log(`    ${truncated}`);

  if (result.toolCalls && result.toolCalls.length > 0) {
    console.log(`  Tool calls: ${result.toolCalls.length}`);
    for (let i = 0; i < result.toolCalls.length; i++) {
      const tc = result.toolCalls[i];
      const argsPreview = JSON.stringify(tc.args).substring(0, 80);
      console.log(`    ${i + 1}. ${tc.name}(${argsPreview})`);
    }
  }

  console.log(`  Status: OK`);
  console.log();
}

function saveResult(fixture: AgentFixture, result: FixtureResult): void {
  const agentDir = path.resolve(
    __dirname,
    'agents',
    agentIdToDir(fixture.agentId),
  );
  if (!fs.existsSync(agentDir)) {
    fs.mkdirSync(agentDir, { recursive: true });
  }
  const resultPath = path.join(agentDir, `${fixture.id}.result.json`);
  fs.writeFileSync(resultPath, JSON.stringify(result, null, 2) + '\n');
}

program.parse();
