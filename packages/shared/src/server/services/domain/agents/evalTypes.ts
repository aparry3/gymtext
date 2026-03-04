/**
 * Eval System Types
 *
 * Types for the agent evaluation/scoring system.
 * Uses LLM-as-judge to score agent outputs against rubrics.
 */

/**
 * Score for a single evaluation dimension
 */
export interface EvalDimensionScore {
  /** Weight of this dimension (0.0-1.0, all weights should sum to 1.0) */
  weight: number;
  /** Score for this dimension (0-10) */
  score: number;
  /** Feedback/reasoning for this score */
  notes: string;
}

/**
 * Structured eval result stored in agent_logs.eval_result
 */
export interface EvalResult {
  dimensions: {
    [dimensionName: string]: EvalDimensionScore;
  };
}

/**
 * Full eval output including metadata (used internally, not all stored in eval_result)
 */
export interface EvalOutput {
  /** The structured dimension scores */
  result: EvalResult;
  /** Weighted overall score (0-10) */
  overallScore: number;
  /** Which model performed the eval */
  evalModel: string;
  /** The prompt sent to the judge */
  evalPrompt: string;
}
