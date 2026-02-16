import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';

export async function GET(request: Request) {
  try {
    const { services } = await getAdminContext();
    const { searchParams } = new URL(request.url);

    const agentId = searchParams.get('agentId') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '50', 10);
    const offset = (page - 1) * pageSize;
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined;
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined;

    const filters = { agentId, startDate, endDate };

    const [logs, total] = await Promise.all([
      services.agentLog.query({
        ...filters,
        limit: pageSize,
        offset,
      }),
      services.agentLog.count(filters),
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

export async function DELETE() {
  try {
    const { services } = await getAdminContext();
    const deleted = await services.agentLog.deleteAll();

    return NextResponse.json({
      success: true,
      data: { deleted },
    });
  } catch (error) {
    console.error('Error clearing agent logs:', error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'An error occurred clearing agent logs',
      },
      { status: 500 }
    );
  }
}
