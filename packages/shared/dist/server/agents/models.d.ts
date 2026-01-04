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
export declare const initializeModel: <T = string>(outputSchema?: unknown, config?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
}, options?: ModelOptions) => InvokableModel<T>;
/**
 * Initialize an image generation model with the provided configuration
 * Uses Google's Gemini image model via the @google/genai SDK
 *
 * @param config - Optional configuration for aspect ratio, image size, etc.
 * @returns Model with invoke() method that generates images from text prompts
 */
export declare const initializeImageModel: (config?: ImageModelConfig) => {
    invoke: (prompt: string) => Promise<ImageGenerationResult>;
};
//# sourceMappingURL=models.d.ts.map