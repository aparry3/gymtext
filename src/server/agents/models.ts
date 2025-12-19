import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI } from "@langchain/openai";
import { GoogleGenAI } from "@google/genai";
import type { StructuredToolInterface } from "@langchain/core/tools";

/**
 * Options for model initialization
 */
export interface ModelOptions {
  tools?: StructuredToolInterface[];
}

/**
 * Configuration for image generation models
 */
export interface ImageModelConfig {
  model?: 'gemini-2.5-flash-image';
  aspectRatio?: "1:1" | "2:3" | "3:2" | "3:4" | "4:3" | "4:5" | "5:4" | "9:16" | "16:9" | "21:9";
  imageSize?: "1K" | "2K" | "4K";
}

/**
 * Result from image generation
 */
export interface ImageGenerationResult {
  imageData: string;
  mimeType: string;
  text?: string;
}

/**
 * A model that can invoke prompts and return responses
 */
export interface InvokableModel<T = unknown> {
  invoke(input: unknown): Promise<T>;
}

/**
 * Initialize the model with structured output using the provided schema
 *
 * @param outputSchema - Optional Zod schema for structured output. If provided, returns T. If undefined, returns string.
 * @param config - Optional agent configuration
 * @param options - Optional model options (e.g., tools)
 * @returns Model that returns structured output (T), plain text (string), or model with tools bound
 */
export const initializeModel = <T = string>(outputSchema?: unknown, config?: { model?: string; temperature?: number; maxTokens?: number }, options?: ModelOptions): InvokableModel<T> => {
    const { model = 'gpt-5-nano', temperature = 1, maxTokens = 8000 } = config || {};

    if (model.startsWith('gemini')) {
      const llm = new ChatGoogleGenerativeAI({
        model: model,
        temperature,
        maxOutputTokens: maxTokens,
      })
      if (options?.tools) {
        return llm.bindTools(options.tools) as unknown as InvokableModel<T>;
      }
      if (outputSchema) {
        return llm.withStructuredOutput(outputSchema) as unknown as InvokableModel<T>;
      }
      // When no schema provided, wrap LLM to auto-extract .content from AIMessage
      return {
        invoke: async (input: unknown): Promise<T> => {
          const response = await llm.invoke(input as Parameters<typeof llm.invoke>[0]);
          const content = typeof response.content === 'string'
            ? response.content
            : String(response.content);
          return content as T;
        }
      };
    } else {
      const llm = new ChatOpenAI({
        model: model,
        temperature: model !== 'gpt-5-nano' ? temperature : 1,
        maxCompletionTokens: maxTokens,
        reasoningEffort: 'low',
      })
      if (options?.tools) {
        return llm.bindTools(options.tools) as unknown as InvokableModel<T>;
      }
      if (outputSchema) {
        return llm.withStructuredOutput(outputSchema) as unknown as InvokableModel<T>;
      }
      // When no schema provided, wrap LLM to auto-extract .content from AIMessage
      return {
        invoke: async (input: unknown): Promise<T> => {
          const response = await llm.invoke(input as Parameters<typeof llm.invoke>[0]);
          const content = typeof response.content === 'string'
            ? response.content
            : String(response.content);
          return content as T;
        }
      };
    }
  };

/**
 * Initialize an image generation model with the provided configuration
 * Uses Google's Gemini image model via the @google/genai SDK
 *
 * @param config - Optional configuration for aspect ratio, image size, etc.
 * @returns Model with invoke() method that generates images from text prompts
 */
export const initializeImageModel = (config?: ImageModelConfig) => {
  const { model = 'gemini-2.5-flash-image', aspectRatio = '3:4', imageSize = '2K' } = config || {};

  const googleGenAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! });

  return {
    invoke: async (prompt: string): Promise<ImageGenerationResult> => {
      const response = await googleGenAI.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseModalities: ["TEXT", "IMAGE"],
          imageConfig: { aspectRatio, imageSize },
        },
      });

      // Extract image data from response
      const parts = response.candidates?.[0]?.content?.parts;
      let imageData: string | undefined;
      let mimeType = "image/png";
      let text: string | undefined;

      if (parts) {
        for (const part of parts) {
          if ("text" in part && part.text) text = part.text;
          if ("inlineData" in part && part.inlineData) {
            imageData = part.inlineData.data;
            mimeType = part.inlineData.mimeType ?? "image/png";
          }
        }
      }

      if (!imageData) throw new Error("No image data returned from model");

      return { imageData, mimeType, text };
    }
  };
};
