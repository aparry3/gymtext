import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getProgramsContext } from '@/lib/context';

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/programs/[id]
 *
 * Get a specific program with its versions
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const cookieStore = await cookies();
    const ownerCookie = cookieStore.get('gt_programs_owner');

    if (!ownerCookie?.value) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const ownerId = ownerCookie.value;
    const { services } = await getProgramsContext();

    // Get the program
    const program = await services.program.getById(id);

    if (!program) {
      return NextResponse.json(
        { success: false, message: 'Program not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (program.ownerId !== ownerId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Get versions
    const versions = await services.programVersion.getByProgramId(id);

    // Get enrollment count
    const enrollmentCount = await services.enrollment.countActiveEnrollments(id);

    return NextResponse.json({
      success: true,
      data: {
        program,
        versions,
        enrollmentCount,
      },
    });
  } catch (error) {
    console.error('[Programs API] Error fetching program:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/programs/[id]
 *
 * Update a program
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const cookieStore = await cookies();
    const ownerCookie = cookieStore.get('gt_programs_owner');

    if (!ownerCookie?.value) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const ownerId = ownerCookie.value;
    const body = await request.json();
    const { services } = await getProgramsContext();

    // Get the program to verify ownership
    const existing = await services.program.getById(id);

    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Program not found' },
        { status: 404 }
      );
    }

    if (existing.ownerId !== ownerId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Update allowed fields
    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.description !== undefined) updateData.description = body.description?.trim() || null;
    if (body.schedulingMode !== undefined) updateData.schedulingMode = body.schedulingMode;
    if (body.cadence !== undefined) updateData.cadence = body.cadence;
    if (body.lateJoinerPolicy !== undefined) updateData.lateJoinerPolicy = body.lateJoinerPolicy || null;
    if (body.billingModel !== undefined) updateData.billingModel = body.billingModel;
    if (body.coverImageId !== undefined) updateData.coverImageId = body.coverImageId || null;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.isPublic !== undefined) updateData.isPublic = body.isPublic;

    const program = await services.program.update(id, updateData);

    return NextResponse.json({
      success: true,
      data: program,
    });
  } catch (error) {
    console.error('[Programs API] Error updating program:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
