import { ChatOpenAI } from "@langchain/openai";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";

/**
 * OpenRouter provider — routes to any open-source or third-party model
 * via a single API key and base URL.
 *
 * Model IDs use OpenRouter format: "provider/model-name"
 * e.g. "minimax/MiniMax-M2.5", "deepseek/deepseek-chat", "x-ai/grok-3"
 */
export function createOpenRouterModel(model: string, temperature: number, maxTokens: number): BaseChatModel {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error(
      'OPENROUTER_API_KEY is not set. Set this environment variable to use third-party models via OpenRouter.'
    );
  }
  return new ChatOpenAI({
    model,
    temperature,
    maxTokens,
    configuration: {
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey,
    },
  });
}
