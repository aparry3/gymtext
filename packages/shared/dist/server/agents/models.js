import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI } from "@langchain/openai";
import { GoogleGenAI } from "@google/genai";
import { getAiSecrets } from "@/server/config";
/**
 * Initialize the model with structured output using the provided schema
 *
 * @param outputSchema - Optional Zod schema for structured output. If provided, returns T. If undefined, returns string.
 * @param config - Optional agent configuration
 * @param options - Optional model options (e.g., tools)
 * @returns Model that returns structured output (T), plain text (string), or model with tools bound
 */
export const initializeModel = (outputSchema, config, options) => {
    const { model = 'gpt-5-nano', temperature = 1, maxTokens = 16000 } = config || {};
    if (model.startsWith('gemini')) {
        const llm = new ChatGoogleGenerativeAI({
            model: model,
            temperature,
            maxOutputTokens: maxTokens,
        });
        if (options?.tools) {
            return llm.bindTools(options.tools);
        }
        if (outputSchema) {
            return llm.withStructuredOutput(outputSchema);
        }
        // When no schema provided, wrap LLM to auto-extract .content from AIMessage
        return {
            invoke: async (input) => {
                const response = await llm.invoke(input);
                const content = typeof response.content === 'string'
                    ? response.content
                    : String(response.content);
                return content;
            }
        };
    }
    else {
        const llm = new ChatOpenAI({
            model: model,
            temperature: model !== 'gpt-5-nano' ? temperature : 1,
            maxCompletionTokens: maxTokens,
            reasoningEffort: 'low',
        });
        if (options?.tools) {
            return llm.bindTools(options.tools);
        }
        if (outputSchema) {
            return llm.withStructuredOutput(outputSchema);
        }
        // When no schema provided, wrap LLM to auto-extract .content from AIMessage
        return {
            invoke: async (input) => {
                const response = await llm.invoke(input);
                const content = typeof response.content === 'string'
                    ? response.content
                    : String(response.content);
                return content;
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
export const initializeImageModel = (config) => {
    const { model = 'gemini-2.5-flash-image', aspectRatio = '3:4', imageSize = '2K' } = config || {};
    const { googleApiKey } = getAiSecrets();
    const googleGenAI = new GoogleGenAI({ apiKey: googleApiKey });
    return {
        invoke: async (prompt) => {
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
            let imageData;
            let mimeType = "image/png";
            let text;
            if (parts) {
                for (const part of parts) {
                    if ("text" in part && part.text)
                        text = part.text;
                    if ("inlineData" in part && part.inlineData) {
                        imageData = part.inlineData.data;
                        mimeType = part.inlineData.mimeType ?? "image/png";
                    }
                }
            }
            if (!imageData)
                throw new Error("No image data returned from model");
            return { imageData, mimeType, text };
        }
    };
};
