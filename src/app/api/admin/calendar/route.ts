import { NextResponse } from 'next/server';
import { dayConfigService } from '@/server/services';

/**
 * GET /api/admin/calendar
 * Get day configs for a month (for calendar view)
 *
 * Query params:
 * - year: number (defaults to current year)
 * - month: number 1-12 (defaults to current month)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const now = new Date();
    const year = parseInt(
      searchParams.get('year') || String(now.getFullYear()),
      10
    );
    const month = parseInt(
      searchParams.get('month') || String(now.getMonth() + 1),
      10
    );

    // Validate month
    if (month < 1 || month > 12) {
      return NextResponse.json(
        { success: false, message: 'Invalid month (must be 1-12)' },
        { status: 400 }
      );
    }

    const configs = await dayConfigService.getConfigsForMonth(year, month);

    return NextResponse.json({
      success: true,
      data: {
        configs,
        year,
        month,
      },
    });
  } catch (error) {
    console.error('Error fetching calendar configs:', error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to fetch configs',
      },
      { status: 500 }
    );
  }
}
