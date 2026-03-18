/**
 * Comparison Eval Harness
 *
 * Runs identical scenarios through both old and new agent systems,
 * scores outputs using existing eval rubrics, and generates comparison report.
 *
 * Usage:
 *   pnpm eval:compare [--scenarios <file>] [--output <file>]
 */

import type { EvalOutput } from '../../agents/evals/evalTypes';
import { evaluateLog } from '../../agents/evals/evaluateLog';
import { readFile } from 'fs/promises';
import { join } from 'path';

// Use loose types for service containers — these are CLI scripts, not core library
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ServiceContainer = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type NewServiceContainer = any;

/**
 * Test scenario for comparison
 */
export interface TestScenario {
  id: string;
  type: 'chat' | 'onboarding' | 'daily-workout';
  description: string;
  input: {
    userId: string;
    message?: string;
    userContext?: Record<string, unknown>;
  };
  expectedDimensions: string[]; // Which eval dimensions to check
  rubricPath?: string; // Optional custom rubric
}

/**
 * Result from one system (old or new)
 */
export interface SystemResult {
  output: string;
  durationMs: number;
  error?: string;
  tokens?: { prompt: number; completion: number; total: number };
  model?: string;
}

/**
 * Comparison result for a single scenario
 */
export interface ComparisonResult {
  scenario: TestScenario;
  old: SystemResult & { eval?: EvalOutput };
  new: SystemResult & { eval?: EvalOutput };
  winner: 'old' | 'new' | 'tie' | 'both-failed';
  scoreDiff: number; // new score - old score
  notes: string[];
}

/**
 * Full comparison report
 */
export interface ComparisonReport {
  timestamp: string;
  scenarios: ComparisonResult[];
  summary: {
    totalScenarios: number;
    newWins: number;
    oldWins: number;
    ties: number;
    failures: number;
    avgScoreDiffNew: number; // Average: (new score - old score)
    avgScoreOld: number;
    avgScoreNew: number;
  };
}

/**
 * Run a single scenario through old system
 */
async function runOldSystem(
  scenario: TestScenario,
  services: ServiceContainer
): Promise<SystemResult> {
  const start = Date.now();
  try {
    let output: string;

    switch (scenario.type) {
      case 'chat': {
        if (!scenario.input.message) throw new Error('Chat requires message');
        const result = await services.chat.processMessage({
          userId: scenario.input.userId,
          message: scenario.input.message,
        });
        output = result.response;
        break;
      }
      case 'onboarding': {
        const result = await services.onboarding.onboardUser(
          scenario.input.userId
        );
        output = JSON.stringify(result, null, 2);
        break;
      }
      case 'daily-workout': {
        const result = await services.workout.generateDailyWorkout(
          scenario.input.userId
        );
        output = result.message || JSON.stringify(result);
        break;
      }
      default:
        throw new Error(`Unknown scenario type: ${scenario.type}`);
    }

    return {
      output,
      durationMs: Date.now() - start,
    };
  } catch (error) {
    return {
      output: '',
      durationMs: Date.now() - start,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Run a single scenario through new agent-runner system
 */
async function runNewSystem(
  scenario: TestScenario,
  services: NewServiceContainer
): Promise<SystemResult> {
  const start = Date.now();
  try {
    let output: string;
    let tokens: { prompt: number; completion: number; total: number } | undefined;
    let model: string | undefined;

    switch (scenario.type) {
      case 'chat': {
        if (!scenario.input.message) throw new Error('Chat requires message');
        const result = await services.newChat.processMessage({
          userId: scenario.input.userId,
          message: scenario.input.message,
        });
        output = result.response;
        tokens = result.usage;
        model = result.model;
        break;
      }
      case 'onboarding': {
        const result = await services.newOnboarding.onboardUser(
          scenario.input.userId,
          scenario.input.userContext
        );
        output = JSON.stringify(result, null, 2);
        break;
      }
      case 'daily-workout': {
        const result = await services.newDailyWorkout.generateDailyWorkout(
          scenario.input.userId
        );
        output = result.message;
        break;
      }
      default:
        throw new Error(`Unknown scenario type: ${scenario.type}`);
    }

    return {
      output,
      durationMs: Date.now() - start,
      tokens,
      model,
    };
  } catch (error) {
    return {
      output: '',
      durationMs: Date.now() - start,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Evaluate output using existing eval system
 */
async function evaluateOutput(
  output: string,
  input: string,
  rubricPath: string,
  agentId: string
): Promise<EvalOutput | undefined> {
  try {
    // Read rubric file
    const rubric = await readFile(rubricPath, 'utf-8');

    // Create mock log entry (loose type — eval CLI script)
    const logEntry = {
      agentId,
      input,
      response: output,
    } as any;

    // Create mock config with rubric
    const config = {
      evalRubric: rubric,
    } as any;

    // Run eval
    return await evaluateLog(logEntry, config) || undefined;
  } catch (error) {
    console.error(`[evaluateOutput] Failed to evaluate:`, error);
    return undefined;
  }
}

/**
 * Run comparison eval for all scenarios
 */
export async function runComparisonEval(
  scenarios: TestScenario[],
  services: ServiceContainer,
  newServices: NewServiceContainer
): Promise<ComparisonReport> {
  const results: ComparisonResult[] = [];

  for (const scenario of scenarios) {
    console.log(`\n[ComparisonEval] Running scenario: ${scenario.id}`);

    // Run both systems in parallel
    const [oldResult, newResult] = await Promise.all([
      runOldSystem(scenario, services),
      runNewSystem(scenario, newServices),
    ]);

    // Evaluate both outputs if rubric exists
    let oldEval: EvalOutput | undefined;
    let newEval: EvalOutput | undefined;
    if (scenario.rubricPath) {
      const inputStr = scenario.input.message || JSON.stringify(scenario.input);
      const rubricFullPath = join(__dirname, scenario.rubricPath);
      [oldEval, newEval] = await Promise.all([
        evaluateOutput(oldResult.output, inputStr, rubricFullPath, `old-${scenario.type}`),
        evaluateOutput(newResult.output, inputStr, rubricFullPath, `new-${scenario.type}`),
      ]);
    }

    // Determine winner
    let winner: 'old' | 'new' | 'tie' | 'both-failed';
    let scoreDiff = 0;
    const notes: string[] = [];

    if (oldResult.error && newResult.error) {
      winner = 'both-failed';
      notes.push(`Both systems failed`);
      notes.push(`Old error: ${oldResult.error}`);
      notes.push(`New error: ${newResult.error}`);
    } else if (oldResult.error) {
      winner = 'new';
      notes.push(`Old system failed: ${oldResult.error}`);
    } else if (newResult.error) {
      winner = 'old';
      notes.push(`New system failed: ${newResult.error}`);
    } else if (oldEval && newEval) {
      scoreDiff = newEval.overallScore - oldEval.overallScore;
      if (scoreDiff > 0.5) {
        winner = 'new';
        notes.push(`New system scored ${scoreDiff.toFixed(2)} points higher`);
      } else if (scoreDiff < -0.5) {
        winner = 'old';
        notes.push(`Old system scored ${Math.abs(scoreDiff).toFixed(2)} points higher`);
      } else {
        winner = 'tie';
        notes.push(`Scores within 0.5 points (diff: ${scoreDiff.toFixed(2)})`);
      }
    } else {
      winner = 'tie';
      notes.push('No eval scores available - manual review needed');
    }

    // Add performance notes
    const speedDiff = oldResult.durationMs - newResult.durationMs;
    if (Math.abs(speedDiff) > 100) {
      notes.push(
        `Performance: ${speedDiff > 0 ? 'new' : 'old'} system ${Math.abs(speedDiff)}ms faster`
      );
    }

    results.push({
      scenario,
      old: { ...oldResult, eval: oldEval },
      new: { ...newResult, eval: newEval },
      winner,
      scoreDiff,
      notes,
    });
  }

  // Calculate summary
  const summary = {
    totalScenarios: results.length,
    newWins: results.filter((r) => r.winner === 'new').length,
    oldWins: results.filter((r) => r.winner === 'old').length,
    ties: results.filter((r) => r.winner === 'tie').length,
    failures: results.filter((r) => r.winner === 'both-failed').length,
    avgScoreDiffNew:
      results.filter((r) => !isNaN(r.scoreDiff)).reduce((sum, r) => sum + r.scoreDiff, 0) /
      results.filter((r) => !isNaN(r.scoreDiff)).length || 0,
    avgScoreOld:
      results
        .filter((r) => r.old.eval)
        .reduce((sum, r) => sum + (r.old.eval?.overallScore ?? 0), 0) /
      results.filter((r) => r.old.eval).length || 0,
    avgScoreNew:
      results
        .filter((r) => r.new.eval)
        .reduce((sum, r) => sum + (r.new.eval?.overallScore ?? 0), 0) /
      results.filter((r) => r.new.eval).length || 0,
  };

  return {
    timestamp: new Date().toISOString(),
    scenarios: results,
    summary,
  };
}

/**
 * Format report as markdown
 */
export function formatReportMarkdown(report: ComparisonReport): string {
  const lines: string[] = [];

  lines.push('# Agent System Comparison Eval Report');
  lines.push('');
  lines.push(`**Generated:** ${report.timestamp}`);
  lines.push('');

  // Summary
  lines.push('## Summary');
  lines.push('');
  lines.push(`- **Total Scenarios:** ${report.summary.totalScenarios}`);
  lines.push(`- **New System Wins:** ${report.summary.newWins}`);
  lines.push(`- **Old System Wins:** ${report.summary.oldWins}`);
  lines.push(`- **Ties:** ${report.summary.ties}`);
  lines.push(`- **Both Failed:** ${report.summary.failures}`);
  lines.push('');
  lines.push(
    `- **Average Score (Old):** ${report.summary.avgScoreOld.toFixed(2)}/10`
  );
  lines.push(
    `- **Average Score (New):** ${report.summary.avgScoreNew.toFixed(2)}/10`
  );
  lines.push(
    `- **Average Score Difference:** ${report.summary.avgScoreDiffNew >= 0 ? '+' : ''}${report.summary.avgScoreDiffNew.toFixed(2)}`
  );
  lines.push('');

  // Per-scenario results
  lines.push('## Scenario Results');
  lines.push('');

  for (const result of report.scenarios) {
    lines.push(`### ${result.scenario.id}`);
    lines.push('');
    lines.push(`**Description:** ${result.scenario.description}`);
    lines.push(`**Type:** ${result.scenario.type}`);
    lines.push(`**Winner:** ${result.winner}`);
    lines.push('');

    // Old system
    lines.push('#### Old System');
    if (result.old.error) {
      lines.push(`- ❌ **Error:** ${result.old.error}`);
    } else {
      lines.push(`- **Duration:** ${result.old.durationMs}ms`);
      if (result.old.eval) {
        lines.push(`- **Score:** ${result.old.eval.overallScore.toFixed(2)}/10`);
      }
    }
    lines.push('');

    // New system
    lines.push('#### New System');
    if (result.new.error) {
      lines.push(`- ❌ **Error:** ${result.new.error}`);
    } else {
      lines.push(`- **Duration:** ${result.new.durationMs}ms`);
      if (result.new.model) {
        lines.push(`- **Model:** ${result.new.model}`);
      }
      if (result.new.tokens) {
        lines.push(`- **Tokens:** ${result.new.tokens.total} (${result.new.tokens.prompt}p + ${result.new.tokens.completion}c)`);
      }
      if (result.new.eval) {
        lines.push(`- **Score:** ${result.new.eval.overallScore.toFixed(2)}/10`);
      }
    }
    lines.push('');

    // Notes
    if (result.notes.length > 0) {
      lines.push('#### Notes');
      for (const note of result.notes) {
        lines.push(`- ${note}`);
      }
      lines.push('');
    }

    lines.push('---');
    lines.push('');
  }

  return lines.join('\n');
}
