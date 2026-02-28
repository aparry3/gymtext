/**
 * Model catalog — static list of known models grouped by provider.
 * Used by admin API to populate model selection UI.
 *
 * OpenAI and Gemini models use direct IDs (routed to their native APIs).
 * All other models use OpenRouter "provider/model" format (routed via OpenRouter).
 */

export interface CatalogModel {
  id: string;
  name: string;
  description?: string;
}

export interface ProviderGroup {
  provider: string;
  models: CatalogModel[];
}

export const MODEL_CATALOG: ProviderGroup[] = [
  {
    provider: 'OpenAI',
    models: [
      { id: 'gpt-5.2', name: 'GPT-5.2' },
      { id: 'gpt-5.1', name: 'GPT-5.1' },
      { id: 'gpt-5-mini', name: 'GPT-5 Mini' },
      { id: 'gpt-5-nano', name: 'GPT-5 Nano' },
      { id: 'gpt-4o', name: 'GPT-4o' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
    ],
  },
  {
    provider: 'Google Gemini',
    models: [
      { id: 'gemini-3.1-pro', name: 'Gemini 3.1 Pro' },
      { id: 'gemini-3.1-flash', name: 'Gemini 3.1 Flash' },
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
      { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite' },
    ],
  },
  {
    provider: 'xAI',
    models: [
      { id: 'x-ai/grok-4-1-fast-reasoning', name: 'Grok 4.1 Fast (Reasoning)' },
      { id: 'x-ai/grok-4-1-fast-non-reasoning', name: 'Grok 4.1 Fast (Non-Reasoning)' },
      { id: 'x-ai/grok-3', name: 'Grok 3' },
      { id: 'x-ai/grok-3-mini', name: 'Grok 3 Mini' },
    ],
  },
  {
    provider: 'DeepSeek',
    models: [
      { id: 'deepseek/deepseek-chat', name: 'DeepSeek Chat' },
      { id: 'deepseek/deepseek-reasoner', name: 'DeepSeek Reasoner' },
    ],
  },
  {
    provider: 'MiniMax',
    models: [
      { id: 'minimax/MiniMax-M2.5', name: 'MiniMax M2.5' },
      { id: 'minimax/MiniMax-M2.5-highspeed', name: 'MiniMax M2.5 Highspeed' },
      { id: 'minimax/MiniMax-M2.1', name: 'MiniMax M2.1' },
      { id: 'minimax/MiniMax-M1', name: 'MiniMax M1' },
    ],
  },
  {
    provider: 'Qwen',
    models: [
      { id: 'qwen/qwen3.5-flash-02-23', name: 'Qwen 3.5 Flash' },
      { id: 'qwen/qwen3.5-35b-a3b', name: 'Qwen 3.5 35B-A3B' },
      { id: 'qwen/qwen3.5-27b', name: 'Qwen 3.5 27B' },
      { id: 'qwen/qwen3.5-plus-02-15', name: 'Qwen 3.5 Plus' },
      { id: 'qwen/qwen3.5-122b-a10b', name: 'Qwen 3.5 122B-A10B' },
      { id: 'qwen/qwen3.5-397b-a17b', name: 'Qwen 3.5 397B-A17B' },
    ],
  },
  {
    provider: 'Kimi / Moonshot',
    models: [
      { id: 'moonshotai/kimi-k2.5', name: 'Kimi K2.5' },
      { id: 'moonshotai/moonshot-v1-128k', name: 'Moonshot V1 128K' },
      { id: 'moonshotai/moonshot-v1-32k', name: 'Moonshot V1 32K' },
    ],
  },
];
