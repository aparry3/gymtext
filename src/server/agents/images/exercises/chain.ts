import { createRunnableAgent, initializeImageModel } from "../../base";
import { buildExerciseImagePrompt } from "./prompts";
import type { ExerciseImageInput, ExerciseImageOutput, ExerciseImageConfig } from "./types";

const DEFAULT_MODEL = "gemini-2.5-flash-image";

/**
 * Create an exercise image generation agent
 * Uses Google's Gemini image model to generate exercise demonstrations
 *
 * @param config - Optional configuration for the agent
 * @returns Agent that generates exercise demonstration images
 */
export function createExerciseImageAgent(config?: ExerciseImageConfig) {
  const model = config?.model ?? DEFAULT_MODEL;
  const imageSize = config?.imageSize ?? "2K";

  return createRunnableAgent<ExerciseImageInput, ExerciseImageOutput>(
    async (input) => {
      const prompt = buildExerciseImagePrompt(input);

      const imageModel = initializeImageModel({
        model,
        aspectRatio: input.aspectRatio ?? "3:4",
        imageSize,
      });

      const result = await imageModel.invoke(prompt);

      return {
        imageData: result.imageData,
        mimeType: result.mimeType,
        description: result.text,
      };
    }
  );
}
