import { ChatOpenAI } from "@langchain/openai";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";

export function createOpenAIModel(model: string, _temperature: number, maxTokens: number): BaseChatModel {
  return new ChatOpenAI({
    model,
    temperature: 1,
    maxCompletionTokens: maxTokens,
    reasoningEffort: 'low',
  });
}
