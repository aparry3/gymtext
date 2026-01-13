import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';
import type { EnrollmentStatus } from '@/components/admin/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { services } = await getAdminContext();

    const enrollment = await services.enrollment.getById(id);
    if (!enrollment) {
      return NextResponse.json(
        { success: false, message: 'Enrollment not found' },
        { status: 404 }
      );
    }

    // Get client and program info
    const client = await services.user.getUserById(enrollment.clientId);
    const program = await services.program.getById(enrollment.programId);

    return NextResponse.json({
      success: true,
      data: {
        ...enrollment,
        clientName: client?.name || 'Unknown',
        clientPhone: client?.phoneNumber || 'Unknown',
        programName: program?.name || 'Unknown',
      }
    });

  } catch (error) {
    console.error('Error fetching enrollment:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred fetching enrollment'
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { status, currentWeek, action } = body;

    const { services } = await getAdminContext();

    // Verify enrollment exists
    const existing = await services.enrollment.getById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Enrollment not found' },
        { status: 404 }
      );
    }

    // Handle action-based updates
    if (action) {
      let newStatus: EnrollmentStatus;

      switch (action) {
        case 'pause':
          if (existing.status !== 'active') {
            return NextResponse.json(
              { success: false, message: 'Can only pause active enrollments' },
              { status: 400 }
            );
          }
          newStatus = 'paused';
          break;
        case 'resume':
          if (existing.status !== 'paused') {
            return NextResponse.json(
              { success: false, message: 'Can only resume paused enrollments' },
              { status: 400 }
            );
          }
          newStatus = 'active';
          break;
        case 'cancel':
          if (existing.status === 'cancelled' || existing.status === 'completed') {
            return NextResponse.json(
              { success: false, message: 'Enrollment is already cancelled or completed' },
              { status: 400 }
            );
          }
          newStatus = 'cancelled';
          break;
        case 'complete':
          if (existing.status !== 'active') {
            return NextResponse.json(
              { success: false, message: 'Can only complete active enrollments' },
              { status: 400 }
            );
          }
          newStatus = 'completed';
          break;
        default:
          return NextResponse.json(
            { success: false, message: 'Invalid action. Use pause, resume, cancel, or complete' },
            { status: 400 }
          );
      }

      const enrollment = await services.enrollment.updateStatus(id, newStatus);
      return NextResponse.json({
        success: true,
        data: enrollment
      });
    }

    // Handle direct field updates
    if (status !== undefined) {
      const validStatuses: EnrollmentStatus[] = ['active', 'paused', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { success: false, message: 'Invalid status' },
          { status: 400 }
        );
      }
    }

    if (currentWeek !== undefined && (typeof currentWeek !== 'number' || currentWeek < 1)) {
      return NextResponse.json(
        { success: false, message: 'currentWeek must be a positive number' },
        { status: 400 }
      );
    }

    // Build update object
    const updates: Record<string, unknown> = {};
    if (status !== undefined) updates.status = status;
    if (currentWeek !== undefined) updates.currentWeek = currentWeek;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, message: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const enrollment = await services.enrollment.update(id, updates);

    return NextResponse.json({
      success: true,
      data: enrollment
    });

  } catch (error) {
    console.error('Error updating enrollment:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred updating enrollment'
      },
      { status: 500 }
    );
  }
}
