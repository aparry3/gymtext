import { AgentConfig } from "@/server/agents/base";
import type { MicrocyclePatternInput } from '../../types';

export interface LongFormMicrocycleConfig {
  systemPrompt: string;
  agentConfig?: AgentConfig;
}

// Input is just MicrocyclePatternInput - prompt is generated internally
export type LongFormMicrocycleInput = MicrocyclePatternInput;

export interface LongFormMicrocycleOutput {
  description: string;
}
