import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';
import type { OwnerType } from '@/components/admin/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { services } = await getAdminContext();

    const owner = await services.programOwner.getById(id);

    if (!owner) {
      return NextResponse.json(
        { success: false, message: 'Program owner not found' },
        { status: 404 }
      );
    }

    // Get programs for this owner
    const programs = await services.program.getByOwnerId(id);

    // Get enrollment counts for each program
    const programsWithStats = await Promise.all(
      programs.map(async (program) => {
        const enrollmentCount = await services.enrollment.countActiveEnrollments(program.id);
        return {
          id: program.id,
          name: program.name,
          isActive: program.isActive,
          enrollmentCount,
          createdAt: program.createdAt,
        };
      })
    );

    // Calculate totals for the owner
    const programCount = programs.length;
    const enrollmentCount = programsWithStats.reduce((sum, p) => sum + p.enrollmentCount, 0);

    return NextResponse.json({
      success: true,
      data: {
        owner: {
          ...owner,
          programCount,
          enrollmentCount,
        },
        programs: programsWithStats,
      }
    });

  } catch (error) {
    console.error('Error fetching program owner:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred fetching program owner'
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { services } = await getAdminContext();

    // Check owner exists
    const existing = await services.programOwner.getById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Program owner not found' },
        { status: 404 }
      );
    }

    // Prevent modifying AI owner type
    if (existing.ownerType === 'ai' && body.ownerType && body.ownerType !== 'ai') {
      return NextResponse.json(
        { success: false, message: 'Cannot change the type of the AI owner' },
        { status: 400 }
      );
    }

    // Validate ownerType if provided
    if (body.ownerType) {
      const validTypes: OwnerType[] = ['ai', 'coach', 'trainer', 'influencer'];
      if (!validTypes.includes(body.ownerType)) {
        return NextResponse.json(
          { success: false, message: 'Invalid ownerType' },
          { status: 400 }
        );
      }
    }

    // Build update object
    const updateData: Record<string, unknown> = {};
    if (body.displayName !== undefined) updateData.displayName = body.displayName;
    if (body.bio !== undefined) updateData.bio = body.bio;
    if (body.avatarUrl !== undefined) updateData.avatarUrl = body.avatarUrl;
    if (body.wordmarkUrl !== undefined) updateData.wordmarkUrl = body.wordmarkUrl;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.userId !== undefined) updateData.userId = body.userId;

    const updated = await services.programOwner.update(id, updateData);

    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Failed to update program owner' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated
    });

  } catch (error) {
    console.error('Error updating program owner:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred updating program owner'
      },
      { status: 500 }
    );
  }
}
