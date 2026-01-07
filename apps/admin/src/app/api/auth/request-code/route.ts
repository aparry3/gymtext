import { NextRequest, NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';
import { normalizeUSPhoneNumber } from '@/shared/utils/phoneUtils';

/**
 * POST /api/auth/admin/request-code
 *
 * Request a 6-digit verification code for admin login
 * Only sends codes to phone numbers in the ADMIN_PHONE_NUMBERS whitelist
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

    // Normalize and validate phone number
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
    const { services } = await getAdminContext();

    // Request verification code (checks whitelist internally)
    const result = await services.adminAuth.requestCode(normalizedPhone);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent successfully',
    });
  } catch (error) {
    console.error('[AdminAuth] Error in request-code API:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
