import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getProgramsContext } from '@/lib/context';

/**
 * GET /api/programs
 *
 * List all programs for the authenticated program owner
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const ownerCookie = cookieStore.get('gt_programs_owner');

    if (!ownerCookie?.value) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const ownerId = ownerCookie.value;
    const { services } = await getProgramsContext();

    // Get all programs for this owner
    const programs = await services.program.getByOwnerId(ownerId);

    // Get enrollment counts for each program
    const programsWithStats = await Promise.all(
      programs.map(async (program) => {
        const enrollmentCount = await services.enrollment.countActiveEnrollments(program.id);
        return {
          ...program,
          enrollmentCount,
        };
      })
    );

    // Calculate stats
    const stats = {
      totalPrograms: programs.length,
      activePrograms: programs.filter(p => p.isActive).length,
      totalEnrollments: programsWithStats.reduce((sum, p) => sum + p.enrollmentCount, 0),
    };

    return NextResponse.json({
      success: true,
      data: {
        programs: programsWithStats,
        stats,
      },
    });
  } catch (error) {
    console.error('[Programs API] Error listing programs:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/programs
 *
 * Create a new program for the authenticated program owner
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const ownerCookie = cookieStore.get('gt_programs_owner');

    if (!ownerCookie?.value) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const ownerId = ownerCookie.value;
    const body = await request.json();

    const {
      name,
      description,
      schedulingMode = 'rolling_start',
      cadence = 'calendar_days',
      lateJoinerPolicy,
      billingModel = 'free',
      coverImageId,
    } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Program name is required' },
        { status: 400 }
      );
    }

    const { services } = await getProgramsContext();

    // Create the program
    const program = await services.program.create({
      ownerId,
      name: name.trim(),
      description: description?.trim() || null,
      schedulingMode,
      cadence,
      lateJoinerPolicy: lateJoinerPolicy || null,
      billingModel,
      coverImageId: coverImageId || null,
      isActive: false, // Start as draft
      isPublic: false,
    });

    return NextResponse.json({
      success: true,
      data: program,
    }, { status: 201 });
  } catch (error) {
    console.error('[Programs API] Error creating program:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
