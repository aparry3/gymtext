/**
 * Maps LLM-generated session types to database-compatible session types
 *
 * Database expects: 'strength', 'cardio', 'mobility', 'recovery', 'assessment', 'deload'
 * LLM generates: 'run', 'lift', 'metcon', 'mobility', 'rest', 'other'
 */

export const SESSION_TYPE_MAP: Record<string, string> = {
  // LLM type -> DB type
  'lift': 'strength',
  'run': 'cardio',
  'metcon': 'cardio', // metabolic conditioning is a form of cardio
  'mobility': 'mobility', // no change needed
  'rest': 'recovery',
  'other': 'recovery', // default catch-all maps to recovery
} as const;

// Valid database session types
export const DB_SESSION_TYPES = [
  'strength',
  'cardio',
  'mobility',
  'recovery',
  'assessment',
  'deload'
] as const;

export type DBSessionType = typeof DB_SESSION_TYPES[number];

// LLM session types (from schema)
export const LLM_SESSION_TYPES = [
  'run',
  'lift',
  'metcon',
  'mobility',
  'rest',
  'other'
] as const;

export type LLMSessionType = typeof LLM_SESSION_TYPES[number];

/**
 * Maps an LLM session type to a database-compatible session type
 * @param llmSessionType The session type from LLM
 * @returns The corresponding database session type
 */
export function mapSessionType(llmSessionType: string): DBSessionType {
  const mapped = SESSION_TYPE_MAP[llmSessionType];

  if (!mapped) {
    // If we get an unmapped type, default to 'recovery'
    console.warn(`Unknown LLM session type: ${llmSessionType}, defaulting to 'recovery'`);
    return 'recovery';
  }

  return mapped as DBSessionType;
}

/**
 * Validates if a session type is valid for the database
 * @param sessionType The session type to validate
 * @returns True if valid for database
 */
export function isValidDBSessionType(sessionType: string): sessionType is DBSessionType {
  return DB_SESSION_TYPES.includes(sessionType as DBSessionType);
}
