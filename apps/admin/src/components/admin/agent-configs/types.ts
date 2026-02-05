/**
 * Agent Configs Editor Types
 */

export type ModelId =
  | 'gpt-5-nano'
  | 'gpt-5-mini'
  | 'gpt-5.1'
  | 'gpt-4o'
  | 'gemini-2.5-flash'
  | 'gemini-2.5-flash-lite';

export interface AgentConfig {
  id: string;
  systemPrompt: string;
  userPrompt: string | null;
  model: ModelId | null;
  temperature: number | null;
  maxTokens: number | null;
  maxIterations: number | null;
  createdAt: Date;
}

export interface AgentConfigUpdate {
  systemPrompt?: string;
  userPrompt?: string | null;
  model?: ModelId | null;
  temperature?: number | null;
  maxTokens?: number | null;
  maxIterations?: number | null;
}

export const MODEL_OPTIONS: { value: ModelId; label: string; description: string }[] = [
  { value: 'gpt-5-nano', label: 'GPT-5 Nano', description: 'Fast, cost-effective (default)' },
  { value: 'gpt-5-mini', label: 'GPT-5 Mini', description: 'Balanced speed and capability' },
  { value: 'gpt-5.1', label: 'GPT-5.1', description: 'Most capable GPT model' },
  { value: 'gpt-4o', label: 'GPT-4o', description: 'Multimodal flagship' },
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', description: 'Fast Gemini model' },
  { value: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite', description: 'Lightweight Gemini' },
];

export const DEFAULT_CONFIG = {
  model: 'gpt-5-nano' as ModelId,
  temperature: 1,
  maxTokens: 16000,
  maxIterations: 5,
};
