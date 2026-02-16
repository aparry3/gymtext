import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';
import { sql } from 'kysely';

export interface ActivityEvent {
  id: string;
  type: 'signup' | 'enrollment' | 'message_failed';
  title: string;
  description: string | null;
  timestamp: string;
  href: string | null;
}

/**
 * GET /api/dashboard/activity
 * Returns recent activity events for the dashboard feed.
 */
export async function GET() {
  try {
    const { db } = await getAdminContext();

    const events = await sql<ActivityEvent>`
      (
        SELECT
          u.id::text AS id,
          'signup' AS type,
          COALESCE(u.first_name || ' ' || u.last_name, u.first_name, u.phone_number) AS title,
          'New user signup' AS description,
          u.created_at AS timestamp,
          '/users/' || u.id AS href
        FROM users u
        ORDER BY u.created_at DESC
        LIMIT 10
      )
      UNION ALL
      (
        SELECT
          e.id::text AS id,
          'enrollment' AS type,
          COALESCE(u.first_name || ' ' || u.last_name, u.first_name, u.phone_number) AS title,
          'Enrolled in ' || COALESCE(p.name, 'a program') AS description,
          e.created_at AS timestamp,
          '/users/' || u.id AS href
        FROM enrollments e
        JOIN users u ON u.id = e.client_id
        LEFT JOIN programs p ON p.id = e.program_id
        ORDER BY e.created_at DESC
        LIMIT 10
      )
      UNION ALL
      (
        SELECT
          m.id::text AS id,
          'message_failed' AS type,
          COALESCE(u.first_name || ' ' || u.last_name, u.first_name, u.phone_number) AS title,
          'Message delivery failed' AS description,
          m.created_at AS timestamp,
          '/messages?status=failed' AS href
        FROM messages m
        JOIN users u ON u.id = m.client_id
        WHERE m.status = 'failed'
        ORDER BY m.created_at DESC
        LIMIT 10
      )
      ORDER BY timestamp DESC
      LIMIT 20
    `.execute(db);

    return NextResponse.json({ success: true, data: events.rows });
  } catch (error) {
    console.error('Error fetching activity feed:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to fetch activity' },
      { status: 500 }
    );
  }
}
