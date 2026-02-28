import { GoogleGenAI } from "@google/genai";
import { getAiSecrets } from "@/server/config";

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
 * Initialize an image generation model with the provided configuration
 * Uses Google's Gemini image model via the @google/genai SDK
 *
 * @param config - Optional configuration for aspect ratio, image size, etc.
 * @returns Model with invoke() method that generates images from text prompts
 */
export const initializeImageModel = (config?: ImageModelConfig) => {
  const { model = 'gemini-2.5-flash-image', aspectRatio = '3:4', imageSize = '2K' } = config || {};

  const { googleApiKey } = getAiSecrets();
  const googleGenAI = new GoogleGenAI({ apiKey: googleApiKey });

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
