import { NextRequest, NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';
import { sql } from 'kysely';

/**
 * GET /api/evals?startDate=&endDate=
 * Returns eval summary data: avg scores per agent, score distribution, recent low scores
 */
export async function GET(request: NextRequest) {
  try {
    const { db, services } = await getAdminContext();
    const { searchParams } = request.nextUrl;

    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined;
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined;

    const filters = { startDate, endDate };

    // 1. Avg score per agent
    const avgScores = await services.agentLog.avgScorePerAgent(filters);

    // 2. Score distribution (histogram buckets)
    let distQuery = sql<{ bucket: string; count: number }>`
      SELECT
        CASE
          WHEN eval_score >= 9 THEN '9-10'
          WHEN eval_score >= 7 THEN '7-8'
          WHEN eval_score >= 5 THEN '5-6'
          WHEN eval_score >= 3 THEN '3-4'
          ELSE '1-2'
        END AS bucket,
        COUNT(*)::int AS count
      FROM agent_logs
      WHERE eval_score IS NOT NULL
    `;
    if (startDate) {
      distQuery = sql<{ bucket: string; count: number }>`
        SELECT
          CASE
            WHEN eval_score >= 9 THEN '9-10'
            WHEN eval_score >= 7 THEN '7-8'
            WHEN eval_score >= 5 THEN '5-6'
            WHEN eval_score >= 3 THEN '3-4'
            ELSE '1-2'
          END AS bucket,
          COUNT(*)::int AS count
        FROM agent_logs
        WHERE eval_score IS NOT NULL
          AND created_at >= ${startDate}
          ${endDate ? sql`AND created_at <= ${endDate}` : sql``}
        GROUP BY bucket
        ORDER BY bucket DESC
      `;
    } else {
      distQuery = sql<{ bucket: string; count: number }>`
        SELECT
          CASE
            WHEN eval_score >= 9 THEN '9-10'
            WHEN eval_score >= 7 THEN '7-8'
            WHEN eval_score >= 5 THEN '5-6'
            WHEN eval_score >= 3 THEN '3-4'
            ELSE '1-2'
          END AS bucket,
          COUNT(*)::int AS count
        FROM agent_logs
        WHERE eval_score IS NOT NULL
        GROUP BY bucket
        ORDER BY bucket DESC
      `;
    }
    const distribution = await distQuery.execute(db);

    // 3. Recent low-scoring invocations (score < 5)
    const lowScores = await sql<{
      id: string;
      agentId: string;
      evalScore: number;
      input: string | null;
      createdAt: string;
    }>`
      SELECT id, agent_id AS "agentId", eval_score::float AS "evalScore",
             LEFT(input, 120) AS input, created_at AS "createdAt"
      FROM agent_logs
      WHERE eval_score IS NOT NULL AND eval_score < 5
      ${startDate ? sql`AND created_at >= ${startDate}` : sql``}
      ${endDate ? sql`AND created_at <= ${endDate}` : sql``}
      ORDER BY created_at DESC
      LIMIT 20
    `.execute(db);

    // 4. Overall stats
    const overall = await sql<{ totalEvaluated: number; avgScore: number }>`
      SELECT COUNT(*)::int AS "totalEvaluated",
             ROUND(AVG(eval_score)::numeric, 2)::float AS "avgScore"
      FROM agent_logs
      WHERE eval_score IS NOT NULL
      ${startDate ? sql`AND created_at >= ${startDate}` : sql``}
      ${endDate ? sql`AND created_at <= ${endDate}` : sql``}
    `.execute(db);

    return NextResponse.json({
      success: true,
      data: {
        overall: overall.rows[0] ?? { totalEvaluated: 0, avgScore: null },
        agentScores: avgScores,
        distribution: distribution.rows,
        lowScores: lowScores.rows,
      },
    });
  } catch (error) {
    console.error('Error fetching eval data:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to fetch eval data' },
      { status: 500 }
    );
  }
}
