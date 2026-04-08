import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';
import type { SchedulingMode, ProgramCadence, BillingModel, LateJoinerPolicy } from '@/components/admin/types';

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

    // Get enrollment stats and versions
    const [enrollmentCount, versionCount, versions] = await Promise.all([
      services.enrollment.countActiveEnrollments(program.id),
      services.programVersion.countByProgramId(program.id),
      services.programVersion.getByProgramId(program.id),
    ]);

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
          wordmarkUrl: owner.wordmarkUrl,
        },
        versions,
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

    const {
      name, description, ownerId, schedulingMode, cadence, lateJoinerPolicy, billingModel, isActive, isPublic,
      // Pricing fields (Stripe IDs are auto-managed)
      priceAmountCents, priceCurrency,
      // Coach scheduling fields
      schedulingEnabled, schedulingUrl, schedulingNotes,
      // Branding
      smsImageUrl,
    } = body;

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

    // Validate lateJoinerPolicy if provided
    if (lateJoinerPolicy) {
      const validPolicies: LateJoinerPolicy[] = ['start_from_beginning', 'join_current_week'];
      if (!validPolicies.includes(lateJoinerPolicy)) {
        return NextResponse.json(
          { success: false, message: 'lateJoinerPolicy must be start_from_beginning or join_current_week' },
          { status: 400 }
        );
      }
    }

    // Validate billingModel if provided
    if (billingModel) {
      const validModels: BillingModel[] = ['subscription', 'one_time', 'free'];
      if (!validModels.includes(billingModel)) {
        return NextResponse.json(
          { success: false, message: 'billingModel must be subscription, one_time, or free' },
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

    // Handle pricing separately — auto-creates Stripe Product/Price
    let program = existing;
    if (priceAmountCents !== undefined) {
      const updated = await services.program.updatePricing(id, {
        priceAmountCents,
        priceCurrency: priceCurrency || 'usd',
      });
      if (updated) program = updated;
    }

    // Build update object with only provided non-pricing fields
    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (ownerId !== undefined) updates.ownerId = ownerId;
    if (schedulingMode !== undefined) updates.schedulingMode = schedulingMode;
    if (cadence !== undefined) updates.cadence = cadence;
    if (lateJoinerPolicy !== undefined) updates.lateJoinerPolicy = lateJoinerPolicy;
    if (billingModel !== undefined) updates.billingModel = billingModel;
    if (isActive !== undefined) updates.isActive = isActive;
    if (isPublic !== undefined) updates.isPublic = isPublic;
    // Coach scheduling
    if (schedulingEnabled !== undefined) updates.schedulingEnabled = schedulingEnabled;
    if (schedulingUrl !== undefined) updates.schedulingUrl = schedulingUrl;
    if (schedulingNotes !== undefined) updates.schedulingNotes = schedulingNotes;
    // Branding
    if (smsImageUrl !== undefined) updates.smsImageUrl = smsImageUrl;

    if (Object.keys(updates).length > 0) {
      const updated = await services.program.update(id, updates);
      if (updated) program = updated;
    }

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

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { services } = await getAdminContext();

    const existing = await services.program.getById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Program not found' },
        { status: 404 }
      );
    }

    const activeEnrollments = await services.enrollment.countActiveEnrollments(id);
    if (activeEnrollments > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Cannot delete program with ${activeEnrollments} active enrollment(s). Cancel enrollments first.`,
        },
        { status: 409 }
      );
    }

    await services.program.delete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting program:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred deleting program'
      },
      { status: 500 }
    );
  }
}
