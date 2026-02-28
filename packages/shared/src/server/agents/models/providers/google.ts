import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";

export function createGoogleModel(model: string, temperature: number, maxTokens: number): BaseChatModel {
  return new ChatGoogleGenerativeAI({
    model,
    temperature,
    maxOutputTokens: maxTokens,
  });
}
