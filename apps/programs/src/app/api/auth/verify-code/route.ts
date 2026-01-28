import { NextRequest, NextResponse } from 'next/server';
import { getProgramsContext } from '@/lib/context';
import { normalizeUSPhoneNumber } from '@/shared/utils/phoneUtils';
import { isProductionEnvironment } from '@/shared/config/public';

/**
 * POST /api/auth/verify-code
 *
 * Verify a 6-digit code and create a program owner session
 * Sets gt_programs_owner=<ownerId> cookie on success
 *
 * Request body:
 * - phoneNumber: string
 * - code: string (6 digits)
 *
 * Response:
 * - success: boolean
 * - message?: string
 *
 * On success, sets a gt_programs_owner cookie with the owner's ID
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, code } = body;

    // Validate input
    if (!phoneNumber || typeof phoneNumber !== 'string') {
      return NextResponse.json(
        {
          success: false,
          message: 'Phone number is required',
        },
        { status: 400 }
      );
    }

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        {
          success: false,
          message: 'Verification code is required',
        },
        { status: 400 }
      );
    }

    // Normalize phone number
    const normalizedPhone = normalizeUSPhoneNumber(phoneNumber);
    if (!normalizedPhone) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid phone number format. Please enter a valid US phone number.',
        },
        { status: 400 }
      );
    }

    // Get services from context
    const { services } = await getProgramsContext();

    // Verify the code
    const result = await services.programOwnerAuth.verifyCode(normalizedPhone, code);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message || 'Verification failed',
        },
        { status: 401 }
      );
    }

    // Create response with owner session cookie
    const response = NextResponse.json({
      success: true,
      message: 'Verification successful',
      ownerId: result.ownerId,
    });

    // Set owner ID cookie for session
    response.cookies.set('gt_programs_owner', result.ownerId!, {
      httpOnly: true,
      secure: isProductionEnvironment(),
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[ProgramOwnerAuth] Error in verify-code API:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
