/**
 * EvalService - Agent output quality scoring
 *
 * Uses LLM-as-judge to score agent outputs against rubrics defined
 * in agent_definitions.eval_rubric. Scores are stored back on the
 * agent_logs row for review and trending.
 *
 * Design decisions:
 * - LLM-only scoring (no deterministic heuristics) per Aaron's direction
 * - Async fire-and-forget after agent invocation
 * - Structured output with dimension-level scoring
 * - Uses gpt-5-nano by default (cheap, fast, good enough for eval)
 */

import type { AgentLogRepository } from '../../../repositories/agentLogRepository';
import type { AgentDefinitionServiceInstance } from './agentDefinitionService';
import type { EvalResult, EvalOutput } from './evalTypes';
import { initializeModel } from '../../../agents/models';
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

// ─── Service interface ──────────────────────────────────────────────────────

export interface EvalServiceInstance {
  /**
   * Evaluate a single agent log by ID.
   * Fetches the log, loads the agent's rubric, runs LLM judge,
   * and stores the result back on the log row.
   *
   * Returns null if the agent has no rubric defined.
   */
  evaluateLog(logId: string): Promise<EvalOutput | null>;
}

// ─── Dependencies ───────────────────────────────────────────────────────────

export interface EvalServiceDeps {
  agentLogRepository: AgentLogRepository;
  agentDefinitionService: AgentDefinitionServiceInstance;
}

// ─── Factory ────────────────────────────────────────────────────────────────

export function createEvalService(deps: EvalServiceDeps): EvalServiceInstance {
  const { agentLogRepository, agentDefinitionService } = deps;

  return {
    async evaluateLog(logId: string): Promise<EvalOutput | null> {
      // 1. Fetch the log
      const log = await agentLogRepository.getById(logId);
      if (!log) {
        console.warn(`[EvalService] Log not found: ${logId}`);
        return null;
      }

      // 2. Fetch agent definition + rubric
      let config;
      try {
        config = await agentDefinitionService.getAgentDefinition(log.agentId);
      } catch (err) {
        console.warn(`[EvalService] Agent definition not found for ${log.agentId}:`, err);
        return null;
      }

      if (!config.evalRubric) {
        // No rubric = no eval. This is expected for agents without rubrics.
        return null;
      }

      // 3. Build the eval prompt
      const responseText = typeof log.response === 'string'
        ? log.response
        : JSON.stringify(log.response);

      const evalUserPrompt = buildEvalUserPrompt(log.input || '', responseText);
      const evalSystemPrompt = buildEvalSystemPrompt(config.evalRubric);
      const fullEvalPrompt = `${evalSystemPrompt}\n\n---\n\n${evalUserPrompt}`;

      const evalModel = DEFAULT_EVAL_MODEL;

      // 4. Run LLM judge with structured output
      const messages = [
        { role: 'system' as const, content: evalSystemPrompt },
        { role: 'user' as const, content: evalUserPrompt },
      ];

      let parsed: EvalResult;
      try {
        const model = initializeModel<EvalResult>(evalResultSchema, {
          model: evalModel,
          temperature: 0, // Deterministic scoring
          maxTokens: 2000,
        });

        parsed = await model.invoke(messages);
      } catch (err) {
        console.error(`[EvalService] LLM judge failed for log ${logId}:`, err);
        return null;
      }

      // 5. Calculate weighted overall score
      const overallScore = calculateOverallScore(parsed);

      // 6. Persist results
      try {
        await agentLogRepository.updateEval(logId, {
          evalPrompt: fullEvalPrompt,
          evalModel,
          evalResult: JSON.parse(JSON.stringify(parsed)),
          evalScore: overallScore,
        });
      } catch (err) {
        console.error(`[EvalService] Failed to persist eval for log ${logId}:`, err);
        // Still return the result even if persistence fails
      }

      const output: EvalOutput = {
        result: parsed,
        overallScore,
        evalModel,
        evalPrompt: fullEvalPrompt,
      };

      console.log(
        `[EvalService] Scored ${log.agentId} log ${logId}: ${overallScore.toFixed(1)}/10`
      );

      return output;
    },
  };
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

  // Check if weights sum to ~1.0; if not, normalize
  const totalWeight = dimensions.reduce((sum, d) => sum + d.weight, 0);

  if (totalWeight === 0) {
    // Fallback: simple average if no weights
    const sum = dimensions.reduce((s, d) => s + d.score, 0);
    return Math.round((sum / dimensions.length) * 10) / 10;
  }

  const weightedSum = dimensions.reduce((sum, d) => sum + d.score * d.weight, 0);
  const normalized = weightedSum / totalWeight; // Normalize in case weights don't sum to 1

  return Math.round(normalized * 10) / 10;
}
