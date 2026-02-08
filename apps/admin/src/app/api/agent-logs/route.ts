import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';

export async function GET(request: Request) {
  try {
    const { repos } = await getAdminContext();
    const { searchParams } = new URL(request.url);

    const agentId = searchParams.get('agentId') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '50', 10);
    const offset = (page - 1) * pageSize;

    const [logs, total] = await Promise.all([
      repos.agentLog.query({
        agentId,
        limit: pageSize,
        offset,
      }),
      repos.agentLog.count({ agentId }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        logs,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching agent logs:', error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'An error occurred fetching agent logs',
      },
      { status: 500 }
    );
  }
}
