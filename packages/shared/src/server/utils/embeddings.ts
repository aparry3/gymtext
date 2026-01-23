/**
 * Embedding Utilities
 *
 * Generates text embeddings using OpenAI's text-embedding-3-small model.
 * Used for semantic exercise search via pgvector.
 */

import OpenAI from 'openai';
import { getAiSecrets } from '../config';

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    const { openaiApiKey } = getAiSecrets();
    client = new OpenAI({ apiKey: openaiApiKey });
  }
  return client;
}

/**
 * Generate a 1536-dimensional embedding for text using text-embedding-3-small
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await getClient().embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return response.data[0].embedding;
}

/**
 * Compose embedding text for an exercise (name + context)
 * Example: "barbell bench press | chest, shoulders | push | strength"
 */
export function composeExerciseEmbeddingText(exercise: {
  name: string;
  primaryMuscles?: string[] | null;
  force?: string | null;
  category?: string | null;
}): string {
  const parts = [exercise.name];
  if (exercise.primaryMuscles?.length) parts.push(exercise.primaryMuscles.join(', '));
  if (exercise.force) parts.push(exercise.force);
  if (exercise.category) parts.push(exercise.category);
  return parts.join(' | ');
}
