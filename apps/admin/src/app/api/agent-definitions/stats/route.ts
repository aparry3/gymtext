import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';
import { sql } from 'kysely';

export async function GET() {
  try {
    const { db } = await getAdminContext();

    const result = await sql<{
      agent_id: string;
      invocation_count: number;
      last_used: string;
    }>`
      SELECT
        agent_id,
        COUNT(*)::int AS invocation_count,
        MAX(created_at) AS last_used
      FROM agent_logs
      GROUP BY agent_id
    `.execute(db);

    const stats: Record<string, { invocationCount: number; lastUsed: string }> = {};
    for (const row of result.rows) {
      stats[row.agent_id] = {
        invocationCount: row.invocation_count,
        lastUsed: row.last_used,
      };
    }

    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching agent stats:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch agent stats',
      },
      { status: 500 }
    );
  }
}
