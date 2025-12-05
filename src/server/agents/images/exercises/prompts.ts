import type { ExerciseImageInput } from "./types";

/**
 * Build the prompt for exercise image generation
 */
export function buildExerciseImagePrompt(input: ExerciseImageInput): string {
  const styleGuide = getStyleGuide(input.style);

  let prompt = `Generate a clear, professional fitness demonstration image showing the proper form for: ${input.exerciseName}

${styleGuide}

Requirements:
- Show the exercise from an angle that best demonstrates proper form
- The person should be in athletic wear appropriate for a gym setting
- Include clear body positioning that highlights correct posture and alignment
- The background should be clean and not distracting (gym or neutral background)
- Ensure the image is suitable for fitness instruction purposes`;

  if (input.description) {
    prompt += `\n\nAdditional context: ${input.description}`;
  }

  prompt += `\n\nFocus on clarity and educational value for someone learning this exercise.`;

  return prompt;
}

function getStyleGuide(style?: ExerciseImageInput["style"]): string {
  switch (style) {
    case "illustration":
      return "Style: Clean, modern illustration style with clear lines and shapes. Use a simplified color palette.";
    case "diagram":
      return "Style: Technical diagram style showing muscle groups engaged and movement arrows. Include anatomical reference points.";
    case "realistic":
    default:
      return "Style: Photorealistic image of a fit person demonstrating the exercise with proper form.";
  }
}
