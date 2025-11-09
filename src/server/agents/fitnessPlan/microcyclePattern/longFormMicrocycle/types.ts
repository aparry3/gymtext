import { AgentConfig } from "@/server/agents/base";
import type { MicrocyclePatternInput } from '../types';

export interface LongFormMicrocycleConfig {
  systemPrompt: string;
  agentConfig?: AgentConfig;
}

export interface LongFormMicrocycleInput extends MicrocyclePatternInput {
  prompt: string;
}

export interface LongFormMicrocycleOutput {
  description: string;
  reasoning: string;
}
