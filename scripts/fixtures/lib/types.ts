/**
 * Agent Test Fixture Types
 *
 * Fixtures capture the exact inputs/outputs of agent invocations,
 * enabling isolated testing without running the full upstream chain.
 */

/** Message format matching the agent system's Message type */
export interface FixtureMessage {
  role: 'human' | 'ai' | 'system';
  content: string;
}

/** A captured or manually-created agent test fixture */
export interface AgentFixture {
  /** Unique fixture identifier (e.g., 'sarah-chen-onboarding') */
  id: string;
  /** Agent ID to invoke (e.g., 'profile:update', 'plan:generate') */
  agentId: string;
  /** Persona this fixture is based on (e.g., 'sarah-chen') */
  persona: string;
  /** Human-readable description of what this fixture tests */
  description: string;
  /** Tags for filtering (e.g., ['onboarding', 'beginner', 'female']) */
  tags: string[];

  // --- Invoke params (maps directly to SimpleAgentInvokeParams) ---
  /** The input string passed to the agent */
  input?: string;
  /** Pre-assembled context strings (XML-tagged dossier strings) */
  context?: string[];
  /** Parameters passed to the agent (user, currentDate, etc.) */
  params?: Record<string, unknown>;
  /** Previous conversation messages */
  previousMessages?: FixtureMessage[];

  // --- Tool agent support ---
  /** Predefined tool responses for mock mode (keyed by tool name) */
  toolResponses?: Record<string, ToolMockResponse>;

  // --- Reference output ---
  /** Known-good output for comparison/eval scoring */
  reference?: FixtureReference;
}

/** Mock response for a tool call */
export interface ToolMockResponse {
  /** The response string to return */
  response: string;
  /** Accumulated messages from the tool */
  messages?: string[];
}

/** Reference output from a previous agent run */
export interface FixtureReference {
  /** The agent's response */
  response: string;
  /** Accumulated messages */
  messages?: string[];
  /** When this reference was captured */
  capturedAt: string;
  /** Model used for this reference */
  model: string;
  /** Agent log ID if captured from logs */
  agentLogId?: string;
}

/** Result from running a fixture */
export interface FixtureResult {
  /** The fixture that was run */
  fixtureId: string;
  /** Agent ID */
  agentId: string;
  /** The agent's response */
  response: string;
  /** Accumulated messages */
  messages?: string[];
  /** Duration in milliseconds */
  durationMs: number;
  /** Model used */
  model: string;
  /** When this result was generated */
  runAt: string;
  /** Tool calls recorded (mock mode) */
  toolCalls?: Array<{ name: string; args: Record<string, unknown>; timestamp: string }>;
}
