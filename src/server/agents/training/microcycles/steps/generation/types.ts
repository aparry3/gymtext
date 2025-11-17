import type { AgentConfig } from "@/server/agents/base";
import type { MicrocyclePatternInput } from '../../types';

export interface LongFormMicrocycleConfig {
  systemPrompt: string;
  agentConfig?: AgentConfig;
}

// Input is just MicrocyclePatternInput - prompt is generated internally
export type LongFormMicrocycleInput = MicrocyclePatternInput;

export type LongFormMicrocycleOutput = string;

/**
 * Context that flows through the microcycle chain
 */
export interface MicrocycleChainContext extends MicrocyclePatternInput {
  longFormMicrocycle: LongFormMicrocycleOutput;
  isDeload?: boolean; // Added by days extraction step, used by formatting step
}
