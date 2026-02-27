import { Kysely } from 'kysely';
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
  /** Filter logs by time window */
  since?: Date;
  /** Filter by specific log IDs */
  logIds?: string[];
  /** Filter by user ID (matched via metadata.invokeParams.params.user.id) */
  userId?: string;
  /** Overwrite existing fixtures */
  overwrite?: boolean;
}

export async function captureFixtures(options: CaptureOptions): Promise<string[]> {
  const { db, persona, since, logIds, overwrite = false } = options;

  // Build query
  let query = db.selectFrom('agent_logs')
    .selectAll()
    .orderBy('created_at', 'asc');

  if (logIds && logIds.length > 0) {
    query = query.where('id', 'in', logIds);
  }
  if (since) {
    query = query.where('created_at', '>=', since.toISOString());
  }

  const rows = await query.execute() as unknown as AgentLogRow[];

  // Optionally filter by userId in metadata
  let filtered = rows;
  if (options.userId) {
    filtered = rows.filter(row => {
      const meta = row.metadata as any;
      return meta?.invokeParams?.params?.user?.id === options.userId;
    });
  }

  const written: string[] = [];

  for (const row of filtered) {
    const meta = row.metadata as any;
    const invokeParams = meta?.invokeParams;

    // Build fixture
    const fixtureId = `${persona}-${slugify(row.agent_id)}`;
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

function slugify(s: string): string {
  return s.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
}
