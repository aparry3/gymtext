import { NextRequest, NextResponse } from 'next/server';
import { AdminFitnessPlanService } from '@/server/services/adminFitnessPlanService';
import { phoneNumberSearchSchema } from '@/shared/schemas/admin';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  try {
    // Get phone number from query params
    const searchParams = request.nextUrl.searchParams;
    const phoneNumber = searchParams.get('phoneNumber');

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Validate phone number format
    try {
      phoneNumberSearchSchema.parse({ phoneNumber });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid phone number format', details: error.errors },
          { status: 400 }
        );
      }
    }

    // Search for user fitness plans
    const adminService = new AdminFitnessPlanService();
    const userData = await adminService.searchUserFitnessPlans(phoneNumber);

    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Format the response
    const response = await adminService.formatSearchResponse(userData);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error searching fitness plans:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}