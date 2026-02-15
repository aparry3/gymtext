/**
 * ContextProvider interface
 *
 * Each provider declares its name, description, required/optional params,
 * and a resolve function that produces a context string (or null to skip).
 */
export interface ContextProvider {
  /** Unique provider name (matches ContextType enum values) */
  name: string;

  /** Human-readable description of what this provider supplies */
  description: string;

  /** Parameter declarations */
  params: {
    required?: string[];
    optional?: string[];
  };

  /** Template variables available for this provider (e.g., ['content', 'formattedDate']) */
  templateVariables?: string[];

  /** Resolve the context string from params. Return null to skip. */
  resolve: (params: Record<string, unknown>) => Promise<string | null>;
}
