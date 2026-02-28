import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { createGoogleModel } from "./providers/google";
import { createOpenAIModel } from "./providers/openai";
import { createOpenRouterModel } from "./providers/openaiCompat";

type ProviderFactory = (model: string, temperature: number, maxTokens: number) => BaseChatModel;

interface ProviderEntry {
  prefix: string;
  factory: ProviderFactory;
}

/**
 * Provider routing rules, checked in order. First match wins.
 *
 * - OpenAI models (gpt-*, o1-*, etc.) go direct to OpenAI
 * - Gemini models go direct to Google
 * - Everything else routes through OpenRouter using "provider/model" IDs
 *   (e.g. "minimax/MiniMax-M2.5", "deepseek/deepseek-chat", "x-ai/grok-3")
 */
const providers: ProviderEntry[] = [
  { prefix: 'gemini', factory: createGoogleModel },
];

/**
 * Register a custom provider at runtime.
 * Entries are checked in order; first prefix match wins.
 */
export function registerProvider(prefix: string, factory: ProviderFactory): void {
  providers.push({ prefix, factory });
}

/**
 * Resolve a model string to a BaseChatModel instance via the provider registry.
 *
 * Routing logic:
 * 1. Check prefix matches (gemini → Google, any custom registrations)
 * 2. If model contains "/" → OpenRouter (e.g. "minimax/MiniMax-M2.5")
 * 3. Default → OpenAI (handles gpt-*, o1-*, etc.)
 */
export function resolveProvider(model: string, temperature: number, maxTokens: number): BaseChatModel {
  for (const entry of providers) {
    if (model.startsWith(entry.prefix)) {
      return entry.factory(model, temperature, maxTokens);
    }
  }

  // Models with "/" are OpenRouter format (e.g. "minimax/MiniMax-M2.5")
  if (model.includes('/')) {
    return createOpenRouterModel(model, temperature, maxTokens);
  }

  // Default: OpenAI
  return createOpenAIModel(model, temperature, maxTokens);
}
