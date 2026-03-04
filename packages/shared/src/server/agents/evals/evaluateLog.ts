/**
 * evaluateLog - Agent output quality scoring
 *
 * Uses LLM-as-judge to score agent outputs against rubrics defined
 * in agent_definitions.eval_rubric. Scores are stored back on the
 * agent_logs row for review and trending.
 *
 * Design decisions:
 * - LLM-only scoring (no deterministic heuristics) per Aaron's direction
 * - Async fire-and-forget after agent invocation
 * - Structured output with dimension-level scoring
 * - Uses gpt-5-nano (cheap, fast, good enough for eval)
 * - Eval prompts are hardcoded infrastructure, not DB-driven
 * - Accepts log entry + config directly to avoid redundant DB fetches
 */

import type { EvalResult, EvalOutput } from './evalTypes';
import type { DbAgentConfig } from '../../models/agentDefinition';
import type { NewAgentLog } from '../../models/agentLog';
import { initializeModel } from '../models';
import { z } from 'zod';

// ─── Zod schema for structured output ───────────────────────────────────────

const evalDimensionSchema = z.object({
  weight: z.number().min(0).max(1).describe('Weight of this dimension (0.0-1.0)'),
  score: z.number().min(0).max(10).describe('Score for this dimension (0-10)'),
  notes: z.string().describe('Feedback/reasoning for this score'),
});

const evalResultSchema = z.object({
  dimensions: z.record(z.string(), evalDimensionSchema)
    .describe('Dimension-level scores keyed by dimension name'),
});

// ─── Default eval model ─────────────────────────────────────────────────────

const DEFAULT_EVAL_MODEL = 'gpt-5-nano';

// ─── Main function ──────────────────────────────────────────────────────────

/**
 * Evaluate an agent log entry against the agent's rubric.
 *
 * Accepts the log entry and agent config directly (no DB fetches needed).
 * Returns null if the agent has no rubric defined.
 */
export async function evaluateLog(
  logEntry: NewAgentLog,
  config: DbAgentConfig,
): Promise<EvalOutput | null> {
  if (!config.evalRubric) {
    return null;
  }

  // Build the eval prompt
  const responseText = typeof logEntry.response === 'string'
    ? logEntry.response
    : JSON.stringify(logEntry.response);

  const evalUserPrompt = buildEvalUserPrompt(logEntry.input || '', responseText);
  const evalSystemPrompt = buildEvalSystemPrompt(config.evalRubric);

  // Run LLM judge with structured output
  const messages = [
    { role: 'system' as const, content: evalSystemPrompt },
    { role: 'user' as const, content: evalUserPrompt },
  ];

  let parsed: EvalResult;
  try {
    const model = initializeModel<EvalResult>(evalResultSchema, {
      model: DEFAULT_EVAL_MODEL,
      temperature: 0,
      maxTokens: 2000,
    });

    parsed = await model.invoke(messages);
  } catch (err) {
    console.error(`[evaluateLog] LLM judge failed for ${logEntry.agentId}:`, err);
    return null;
  }

  const overallScore = calculateOverallScore(parsed);

  console.log(
    `[evaluateLog] Scored ${logEntry.agentId}: ${overallScore.toFixed(1)}/10`
  );

  return { result: parsed, overallScore };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function buildEvalSystemPrompt(rubric: string): string {
  return `You are an expert quality evaluator for AI agent outputs. Your job is to score an agent's output against a rubric.

Score each dimension defined in the rubric on a 0-10 scale. Be precise and provide specific feedback.

## Scoring Scale
- 10: Perfect — flawless execution
- 8-9: Minor issues — acceptable for production
- 5-7: Significant issues — needs improvement
- 3-4: Major issues — should not be used
- 0-2: Fundamentally broken

## Rubric

${rubric}

## Instructions
- Score ONLY the dimensions defined in the rubric
- Use the weights specified in the rubric for each dimension
- Be specific in your notes — cite exact issues or strengths
- Do not add dimensions that aren't in the rubric`;
}

function buildEvalUserPrompt(input: string, response: string): string {
  return `## Input Given to Agent
${input}

## Agent Output
${response}

Score this output according to the rubric.`;
}

function calculateOverallScore(result: EvalResult): number {
  const dimensions = Object.values(result.dimensions);
  if (dimensions.length === 0) return 0;

  const totalWeight = dimensions.reduce((sum, d) => sum + d.weight, 0);

  if (totalWeight === 0) {
    const sum = dimensions.reduce((s, d) => s + d.score, 0);
    return Math.round((sum / dimensions.length) * 10) / 10;
  }

  const weightedSum = dimensions.reduce((sum, d) => sum + d.score * d.weight, 0);
  const normalized = weightedSum / totalWeight;

  return Math.round(normalized * 10) / 10;
}
