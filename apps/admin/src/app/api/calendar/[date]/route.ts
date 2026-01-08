import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';

/**
 * Parse a date string (YYYY-MM-DD) into a Date object
 * Returns null if invalid
 */
function parseDate(dateStr: string): Date | null {
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;

  const [, yearStr, monthStr, dayStr] = match;
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  // Validate ranges
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  // Create date at noon to avoid timezone issues
  const date = new Date(year, month - 1, day, 12, 0, 0);

  // Verify the date is valid (e.g., not Feb 31)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

interface RouteParams {
  params: Promise<{ date: string }>;
}

/**
 * GET /api/admin/calendar/:date
 * Get config for a specific date
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { date: dateStr } = await params;
    const date = parseDate(dateStr);

    if (!date) {
      return NextResponse.json(
        { success: false, message: 'Invalid date format (use YYYY-MM-DD)' },
        { status: 400 }
      );
    }

    const { services } = await getAdminContext();
    const config = await services.dayConfig.getConfigForDate(date);

    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error('Error fetching day config:', error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to fetch config',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/calendar/:date
 * Set or update config for a specific date
 *
 * Body:
 * - imageUrl: string (required)
 * - imageName: string (optional)
 */
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { date: dateStr } = await params;
    const date = parseDate(dateStr);

    if (!date) {
      return NextResponse.json(
        { success: false, message: 'Invalid date format (use YYYY-MM-DD)' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { imageUrl, imageName } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, message: 'imageUrl is required' },
        { status: 400 }
      );
    }

    const { services } = await getAdminContext();
    const config = await services.dayConfig.setDayImage(date, imageUrl, imageName);

    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error('Error updating day config:', error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to update config',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/calendar/:date
 * Clear config for a specific date
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { date: dateStr } = await params;
    const date = parseDate(dateStr);

    if (!date) {
      return NextResponse.json(
        { success: false, message: 'Invalid date format (use YYYY-MM-DD)' },
        { status: 400 }
      );
    }

    const { services } = await getAdminContext();
    await services.dayConfig.clearConfig(date);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing day config:', error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to clear config',
      },
      { status: 500 }
    );
  }
}
