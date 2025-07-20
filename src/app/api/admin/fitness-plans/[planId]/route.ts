import { NextRequest, NextResponse } from 'next/server';
import { AdminFitnessPlanService } from '@/server/services/adminFitnessPlanService';
import { planIdSchema } from '@/shared/schemas/admin';
import { z } from 'zod';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const { planId } = await params;

    // Validate plan ID format
    try {
      planIdSchema.parse({ planId });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid plan ID format', details: error.errors },
          { status: 400 }
        );
      }
    }

    // Get fitness plan details
    const adminService = new AdminFitnessPlanService();
    const planDetails = await adminService.getFitnessPlanDetails(planId);

    if (!planDetails) {
      return NextResponse.json(
        { error: 'Fitness plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(planDetails);
  } catch (error) {
    console.error('Error fetching fitness plan details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}