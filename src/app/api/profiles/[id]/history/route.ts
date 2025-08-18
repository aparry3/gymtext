import { NextRequest, NextResponse } from 'next/server';
import { postgresDb } from '@/server/connections/postgres/postgres';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    // For now, we'll use the profile ID directly
    // TODO: Add proper authentication

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const source = searchParams.get('source');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const db = postgresDb;

    // Build query
    let query = db
      .selectFrom('profileUpdates')
      .selectAll()
      .where('userId', '=', id)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .offset(offset);

    // Apply filters
    if (source) {
      query = query.where('source', '=', source);
    }
    if (startDate) {
      query = query.where('createdAt', '>=', new Date(startDate));
    }
    if (endDate) {
      query = query.where('createdAt', '<=', new Date(endDate));
    }

    const updates = await query.execute();

    // Get total count for pagination
    let countQuery = db
      .selectFrom('profileUpdates')
      .select(db.fn.count('id').as('count'))
      .where('userId', '=', id);

    if (source) {
      countQuery = countQuery.where('source', '=', source);
    }
    if (startDate) {
      countQuery = countQuery.where('createdAt', '>=', new Date(startDate));
    }
    if (endDate) {
      countQuery = countQuery.where('createdAt', '<=', new Date(endDate));
    }

    const countResult = await countQuery.executeTakeFirst();
    const totalCount = Number(countResult?.count || 0);

    // Format response
    const formattedUpdates = updates.map(update => ({
      id: update.id,
      appliedAt: update.createdAt,
      source: update.source,
      patch: update.patch,
      path: update.path,
      reason: update.reason,
    }));

    return NextResponse.json({
      updates: formattedUpdates,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
      filters: {
        source,
        startDate,
        endDate,
      },
    });
  } catch (error) {
    console.error('Error fetching profile history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile history' },
      { status: 500 }
    );
  }
}