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
 * Current version of the embedding text format.
 * Increment when the format changes to trigger re-embedding.
 */
export const EMBEDDING_TEXT_VERSION = 1;

/**
 * Input type for exercise embedding text generation.
 * Matches the exercises table columns.
 */
export interface ExerciseForEmbedding {
  name: string;
  type: string;
  modality?: string | null;
  movementPatterns?: string[] | null;
  equipment?: string[] | null;
  primaryMuscles?: string[] | null;
  secondaryMuscles?: string[] | null;
  trainingGroups?: string[] | null;
  aliases?: string[] | null;
  shortDescription?: string | null;
}

/**
 * Converts a string to Title Case.
 * Handles acronyms by preserving uppercase sequences.
 */
function toTitleCase(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(/\s+/)
    .map(word => {
      // Preserve common acronyms
      const acronyms = ['db', 'bb', 'kb', 'trx', 'ez', 'ghr', 'rdl', 'hiit', 'amrap', 'emom'];
      if (acronyms.includes(word.toLowerCase())) {
        return word.toUpperCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Normalizes an array of strings: trims, dedupes case-insensitively,
 * sorts alphabetically, and applies Title Case.
 */
function normalizeList(arr: string[] | null | undefined): string[] {
  if (!arr || arr.length === 0) return [];

  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of arr) {
    const trimmed = item.trim();
    if (!trimmed) continue;

    const lower = trimmed.toLowerCase();
    if (seen.has(lower)) continue;

    seen.add(lower);
    result.push(toTitleCase(trimmed));
  }

  return result.sort((a, b) => a.localeCompare(b));
}

/**
 * Normalizes aliases: trims, dedupes, sorts, caps at 25 entries.
 * Keeps original casing for aliases since they may be abbreviations.
 */
function normalizeAliases(arr: string[] | null | undefined): string[] {
  if (!arr || arr.length === 0) return [];

  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of arr) {
    const trimmed = item.trim();
    if (!trimmed) continue;

    const lower = trimmed.toLowerCase();
    if (seen.has(lower)) continue;

    seen.add(lower);
    result.push(trimmed.toLowerCase()); // lowercase for consistency
  }

  return result.sort((a, b) => a.localeCompare(b)).slice(0, 25);
}

/**
 * Generates deterministic, structured embedding text for an exercise.
 *
 * Template format:
 * ```
 * EXERCISE: {name}
 * TYPE: {type} | MODALITY: {modality} | PATTERNS: {patterns_csv} | EQUIPMENT: {equipment_csv}
 * MUSCLES: primary={primary_csv} | secondary={secondary_csv}
 * TAGS: {tags_csv}
 * ALIASES: {aliases_csv}
 * DESCRIPTION: {short_description}
 * ```
 *
 * Normalization rules:
 * 1. Labels: ALL CAPS
 * 2. Values: Title Case, acronyms as-is
 * 3. Lists: Trim, dedupe case-insensitively, sort alphabetically, join with ", "
 * 4. Missing fields: Omit empty lines/segments entirely
 * 5. Aliases: Cap at 25 entries
 * 6. Description: 1-2 sentences max, no steps/cues
 */
export function exerciseToEmbeddingText(exercise: ExerciseForEmbedding): string {
  const lines: string[] = [];

  // Line 1: EXERCISE name (required)
  lines.push(`EXERCISE: ${toTitleCase(exercise.name)}`);

  // Line 2: TYPE | MODALITY | PATTERNS | EQUIPMENT (build dynamically)
  const typeLine: string[] = [];

  typeLine.push(`TYPE: ${toTitleCase(exercise.type)}`);

  if (exercise.modality?.trim()) {
    typeLine.push(`MODALITY: ${toTitleCase(exercise.modality)}`);
  }

  const patterns = normalizeList(exercise.movementPatterns);
  if (patterns.length > 0) {
    typeLine.push(`PATTERNS: ${patterns.join(', ')}`);
  }

  const equipment = normalizeList(exercise.equipment);
  if (equipment.length > 0) {
    typeLine.push(`EQUIPMENT: ${equipment.join(', ')}`);
  }

  lines.push(typeLine.join(' | '));

  // Line 3: MUSCLES (only if we have at least one)
  const primary = normalizeList(exercise.primaryMuscles);
  const secondary = normalizeList(exercise.secondaryMuscles);

  if (primary.length > 0 || secondary.length > 0) {
    const muscleParts: string[] = [];
    if (primary.length > 0) {
      muscleParts.push(`primary=${primary.join(', ')}`);
    }
    if (secondary.length > 0) {
      muscleParts.push(`secondary=${secondary.join(', ')}`);
    }
    lines.push(`MUSCLES: ${muscleParts.join(' | ')}`);
  }

  // Line 4: TAGS (training groups)
  const tags = normalizeList(exercise.trainingGroups);
  if (tags.length > 0) {
    lines.push(`TAGS: ${tags.join(', ')}`);
  }

  // Line 5: ALIASES
  const aliases = normalizeAliases(exercise.aliases);
  if (aliases.length > 0) {
    lines.push(`ALIASES: ${aliases.join(', ')}`);
  }

  // Line 6: DESCRIPTION (only first 1-2 sentences)
  if (exercise.shortDescription?.trim()) {
    // Limit to ~200 chars and ensure it ends cleanly
    let desc = exercise.shortDescription.trim();
    if (desc.length > 200) {
      // Find the last sentence boundary before 200 chars
      const sentenceEnd = desc.lastIndexOf('.', 200);
      if (sentenceEnd > 50) {
        desc = desc.substring(0, sentenceEnd + 1);
      } else {
        desc = desc.substring(0, 200).trim() + '...';
      }
    }
    lines.push(`DESCRIPTION: ${desc}`);
  }

  return lines.join('\n');
}

/**
 * @deprecated Use exerciseToEmbeddingText instead.
 * Kept for backwards compatibility.
 */
export function composeExerciseEmbeddingText(exercise: {
  name: string;
  primaryMuscles?: string[] | null;
  type?: string | null;
}): string {
  // Redirect to new function with minimal fields
  return exerciseToEmbeddingText({
    name: exercise.name,
    type: exercise.type || 'Exercise',
    primaryMuscles: exercise.primaryMuscles,
  });
}
