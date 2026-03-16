/**
 * Agent Runner Logger
 *
 * Structured logging for agent-runner operations.
 * Captures: userId, agentId, duration, token usage, errors.
 *
 * Currently outputs to console.log with JSON structure.
 * Easy to swap for pino/winston/external service later.
 */

export interface AgentLogEntry {
  service: string;
  event: string;
  userId?: string;
  agentId?: string;
  sessionId?: string;
  durationMs?: number;
  tokens?: {
    prompt: number;
    completion: number;
    total: number;
  };
  model?: string;
  error?: string;
  meta?: Record<string, unknown>;
}

export interface AgentLogger {
  info(entry: AgentLogEntry): void;
  warn(entry: AgentLogEntry): void;
  error(entry: AgentLogEntry): void;
  /** Log an agent invocation result with usage metrics */
  invocation(
    service: string,
    userId: string,
    result: {
      output: string;
      invocationId?: string;
      usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
      duration?: number;
      model?: string;
    },
    agentId: string,
  ): void;
}

function formatEntry(level: string, entry: AgentLogEntry): string {
  const ts = new Date().toISOString();
  const prefix = `[${entry.service}]`;
  const parts = [prefix, entry.event];

  if (entry.userId) parts.push(`user=${entry.userId}`);
  if (entry.agentId) parts.push(`agent=${entry.agentId}`);
  if (entry.durationMs !== undefined) parts.push(`${entry.durationMs}ms`);
  if (entry.tokens) parts.push(`tokens=${entry.tokens.total}`);
  if (entry.model) parts.push(`model=${entry.model}`);
  if (entry.error) parts.push(`error="${entry.error}"`);

  // Structured JSON for machine parsing (alongside human-readable line)
  const structured = {
    ts,
    level,
    ...entry,
  };

  return `${parts.join(' ')} | ${JSON.stringify(structured)}`;
}

export function createAgentLogger(): AgentLogger {
  return {
    info(entry) {
      console.log(formatEntry('info', entry));
    },
    warn(entry) {
      console.warn(formatEntry('warn', entry));
    },
    error(entry) {
      console.error(formatEntry('error', entry));
    },
    invocation(service, userId, result, agentId) {
      this.info({
        service,
        event: 'invocation_complete',
        userId,
        agentId,
        durationMs: result.duration,
        tokens: result.usage
          ? {
              prompt: result.usage.promptTokens,
              completion: result.usage.completionTokens,
              total: result.usage.totalTokens,
            }
          : undefined,
        model: result.model,
      });
    },
  };
}

/** Singleton logger instance */
export const agentLogger = createAgentLogger();
