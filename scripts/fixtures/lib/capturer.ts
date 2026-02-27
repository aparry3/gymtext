import { Kysely, sql } from 'kysely';
import fs from 'fs';
import path from 'path';
import type { AgentFixture } from './types';
import { agentIdToDir } from './loader';

const FIXTURES_DIR = path.resolve(__dirname, '../agents');

interface AgentLogRow {
  id: string;
  agent_id: string;
  input: string | null;
  messages: unknown;
  response: unknown;
  metadata: Record<string, unknown> | null;
  model: string | null;
  duration_ms: number | null;
  created_at: string;
}

interface CaptureOptions {
  db: Kysely<any>;
  /** Persona ID for naming/tagging */
  persona: string;
  /** User ID to filter logs by */
  userId: string;
  /** Filter by specific log IDs (overrides userId-based query) */
  logIds?: string[];
  /** Overwrite existing fixtures */
  overwrite?: boolean;
}

/**
 * Capture fixtures from agent_logs for a user.
 *
 * Fetches the most recent invocation of each agent for the given user.
 * When an agent was invoked multiple times in the same run (e.g. workout:details
 * for two different days), all invocations from that latest run are included.
 */
export async function captureFixtures(options: CaptureOptions): Promise<string[]> {
  const { db, persona, userId, logIds, overwrite = false } = options;

  let rows: AgentLogRow[];

  if (logIds && logIds.length > 0) {
    rows = await db.selectFrom('agent_logs')
      .selectAll()
      .where('id', 'in', logIds)
      .orderBy('created_at', 'asc')
      .execute() as unknown as AgentLogRow[];
  } else {
    // Find the most recent run for this user by getting the latest log timestamp,
    // then fetching all logs within a small window of that run.
    // A "run" is a cluster of agent invocations that happen during signup/generation.
    rows = await fetchLatestRunLogs(db, userId);
  }

  const written: string[] = [];
  const agentCounts = new Map<string, number>();

  for (const row of rows) {
    const meta = row.metadata as any;
    const invokeParams = meta?.invokeParams;

    // Build fixture ID with counter for duplicate agents
    const count = (agentCounts.get(row.agent_id) ?? 0) + 1;
    agentCounts.set(row.agent_id, count);
    const suffix = count > 1 ? `-${count}` : '';
    const fixtureId = `${persona}-${slugify(row.agent_id)}${suffix}`;
    const fixture: AgentFixture = {
      id: fixtureId,
      agentId: row.agent_id,
      persona,
      description: `Captured from ${persona} run`,
      tags: [persona, 'captured'],
      input: invokeParams?.input ?? row.input ?? undefined,
      context: invokeParams?.context ?? undefined,
      params: invokeParams?.params ?? undefined,
      previousMessages: undefined,
      reference: {
        response: typeof row.response === 'string' ? row.response : JSON.stringify(row.response),
        capturedAt: row.created_at,
        model: row.model || 'unknown',
        agentLogId: row.id,
      },
    };

    // Write fixture file
    const agentDir = path.join(FIXTURES_DIR, agentIdToDir(row.agent_id));
    fs.mkdirSync(agentDir, { recursive: true });

    const fileName = `${fixtureId}.fixture.json`;
    const filePath = path.join(agentDir, fileName);

    if (fs.existsSync(filePath) && !overwrite) {
      console.log(`  Skipping ${fileName} (exists, use --overwrite to replace)`);
      continue;
    }

    fs.writeFileSync(filePath, JSON.stringify(fixture, null, 2) + '\n');
    written.push(filePath);
  }

  return written;
}

/**
 * Fetch all agent logs from the user's most recent run.
 *
 * Strategy: find the latest log for this user, then grab all logs
 * within 10 minutes before it (a signup run typically completes in <5 min).
 */
async function fetchLatestRunLogs(db: Kysely<any>, userId: string): Promise<AgentLogRow[]> {
  // Get the timestamp of the most recent log for this user
  const latest = await db.selectFrom('agent_logs')
    .select('created_at')
    .where(sql`metadata->'invokeParams'->'params'->'user'->>'id'`, '=', userId)
    .orderBy('created_at', 'desc')
    .limit(1)
    .executeTakeFirst() as { created_at: string } | undefined;

  if (!latest) return [];

  // Fetch all logs for this user within 10 minutes before the latest
  const latestTime = new Date(latest.created_at);
  const windowStart = new Date(latestTime.getTime() - 10 * 60 * 1000);

  const rows = await db.selectFrom('agent_logs')
    .selectAll()
    .where(sql`metadata->'invokeParams'->'params'->'user'->>'id'`, '=', userId)
    .where('created_at', '>=', windowStart.toISOString())
    .orderBy('created_at', 'asc')
    .execute() as unknown as AgentLogRow[];

  return rows;
}

function slugify(s: string): string {
  return s.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
}
