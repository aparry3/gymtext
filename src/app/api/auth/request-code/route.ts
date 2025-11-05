import { NextRequest, NextResponse } from 'next/server';
import { userAuthService } from '@/server/services/auth/userAuthService';

/**
 * POST /api/auth/request-code
 *
 * Request a 6-digit verification code to be sent to a phone number via SMS
 *
 * Request body:
 * - phoneNumber: string (E.164 format or 10-digit US number)
 *
 * Response:
 * - success: boolean
 * - message?: string
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber } = body;

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

    // Basic phone number validation (10 digits or E.164 format)
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length < 10 || cleaned.length > 11) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid phone number format',
        },
        { status: 400 }
      );
    }

    // Request verification code
    const result = await userAuthService.requestVerificationCode(phoneNumber);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent successfully',
    });
  } catch (error) {
    console.error('Error in request-code API:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
