/**
 * Input for exercise image generation
 */
export interface ExerciseImageInput {
  /** Name of the exercise (e.g., "barbell squat", "push-up") */
  exerciseName: string;
  /** Optional description of the exercise or specific form cues */
  description?: string;
  /** Optional style preferences */
  style?: "realistic" | "illustration" | "diagram";
  /** Aspect ratio for the generated image */
  aspectRatio?: "1:1" | "2:3" | "3:2" | "3:4" | "4:3" | "4:5" | "5:4" | "9:16" | "16:9";
}

/**
 * Output from exercise image generation
 */
export interface ExerciseImageOutput {
  /** Base64-encoded image data */
  imageData: string;
  /** MIME type of the image (e.g., "image/png") */
  mimeType: string;
  /** Optional text description returned by the model */
  description?: string;
}

/**
 * Configuration for the exercise image agent
 */
export interface ExerciseImageConfig {
  /** Model to use (defaults to gemini-2.5-flash-image) */
  model?: "gemini-2.5-flash-image";
  /** Image resolution */
  imageSize?: "1K" | "2K" | "4K";
}
