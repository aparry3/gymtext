import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';

export async function GET() {
  try {
    const { services } = await getAdminContext();
    const data = await services.agentLog.avgScorePerAgent();

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching eval summary:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred',
      },
      { status: 500 }
    );
  }
}
