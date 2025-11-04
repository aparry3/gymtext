import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/server/services';
import { checkAuthorization } from '@/server/utils/authMiddleware';

/**
 * GET /api/users/[id]
 *
 * Get user and profile data
 *
 * Authorization:
 * - Admin can access any user
 * - Regular user can only access their own data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: requestedUserId } = await params;

    if (!requestedUserId) {
      return NextResponse.json(
        {
          success: false,
          message: 'User ID is required',
        },
        { status: 400 }
      );
    }

    // Check authorization
    const auth = checkAuthorization(request, requestedUserId);

    if (!auth.isAuthorized) {
      return NextResponse.json(
        {
          success: false,
          message: auth.error || 'Unauthorized',
        },
        { status: 403 }
      );
    }

    // Fetch user data
    const result = await userService.getUserForAdmin(requestedUserId);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error fetching user:', error);

    if (error instanceof Error && error.message === 'User not found') {
      return NextResponse.json(
        {
          success: false,
          message: 'User not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
