import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';
import type { SchedulingMode, ProgramCadence } from '@/components/admin/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { services } = await getAdminContext();

    const program = await services.program.getById(id);
    if (!program) {
      return NextResponse.json(
        { success: false, message: 'Program not found' },
        { status: 404 }
      );
    }

    // Get owner details
    const owner = await services.programOwner.getById(program.ownerId);
    if (!owner) {
      return NextResponse.json(
        { success: false, message: 'Program owner not found' },
        { status: 404 }
      );
    }

    // Get enrollment stats
    const enrollmentCount = await services.enrollment.countActiveEnrollments(program.id);
    const versionCount = await services.enrollment.countVersions(program.id);

    // Get enrollments with client info
    const enrollments = await services.enrollment.listByProgram(program.id);

    // Enrich enrollments with client and program info
    const enrichedEnrollments = await Promise.all(
      enrollments.map(async (enrollment) => {
        const client = await services.user.getUserById(enrollment.clientId);
        return {
          ...enrollment,
          clientName: client?.name || 'Unknown',
          clientPhone: client?.phoneNumber || 'Unknown',
          programName: program.name,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        program: {
          ...program,
          ownerName: owner.displayName,
          ownerType: owner.ownerType,
          enrollmentCount,
          versionCount,
        },
        owner: {
          id: owner.id,
          displayName: owner.displayName,
          ownerType: owner.ownerType,
          avatarUrl: owner.avatarUrl,
        },
        enrollments: enrichedEnrollments,
      }
    });

  } catch (error) {
    console.error('Error fetching program:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred fetching program'
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { name, description, schedulingMode, cadence, isActive, isPublic } = body;

    // Validate schedulingMode if provided
    if (schedulingMode) {
      const validModes: SchedulingMode[] = ['rolling_start', 'cohort'];
      if (!validModes.includes(schedulingMode)) {
        return NextResponse.json(
          { success: false, message: 'schedulingMode must be rolling_start or cohort' },
          { status: 400 }
        );
      }
    }

    // Validate cadence if provided
    if (cadence) {
      const validCadences: ProgramCadence[] = ['calendar_days', 'training_days_only'];
      if (!validCadences.includes(cadence)) {
        return NextResponse.json(
          { success: false, message: 'cadence must be calendar_days or training_days_only' },
          { status: 400 }
        );
      }
    }

    const { services } = await getAdminContext();

    // Verify program exists
    const existing = await services.program.getById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Program not found' },
        { status: 404 }
      );
    }

    // Build update object with only provided fields
    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (schedulingMode !== undefined) updates.schedulingMode = schedulingMode;
    if (cadence !== undefined) updates.cadence = cadence;
    if (isActive !== undefined) updates.isActive = isActive;
    if (isPublic !== undefined) updates.isPublic = isPublic;

    const program = await services.program.update(id, updates);

    return NextResponse.json({
      success: true,
      data: program
    });

  } catch (error) {
    console.error('Error updating program:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred updating program'
      },
      { status: 500 }
    );
  }
}
