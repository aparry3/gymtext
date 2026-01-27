import { NextRequest, NextResponse } from 'next/server';
import { getServices, getRepositories } from '@/lib/context';
import { checkAuthorization } from '@/server/utils/authMiddleware';

/**
 * GET /api/users/[id]/profile
 *
 * Get user profile data including units preference and structured profile
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
    const { id: userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check authorization
    const auth = checkAuthorization(request, userId);
    if (!auth.isAuthorized) {
      return NextResponse.json(
        { success: false, message: auth.error || 'Unauthorized' },
        { status: 403 }
      );
    }

    // Fetch user data
    const services = getServices();
    const repos = getRepositories();

    const user = await services.user.getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Fetch structured profile
    const structuredProfile = await repos.profile.getCurrentStructuredProfile(userId);

    // Get units from user (with fallback for migration)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const units = (user as any).units || 'imperial';

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        units,
        profile: structuredProfile,
      },
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/users/[id]/profile
 *
 * Update user profile data (units preference or profile sections)
 *
 * Request body:
 * - { units: 'imperial' | 'metric' } - Update units preference
 * - { section: string, content: string } - Update profile section (not implemented yet)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check authorization
    const auth = checkAuthorization(request, userId);
    if (!auth.isAuthorized) {
      return NextResponse.json(
        { success: false, message: auth.error || 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Handle units update
    if (body.units) {
      if (body.units !== 'imperial' && body.units !== 'metric') {
        return NextResponse.json(
          { success: false, message: 'Invalid units value' },
          { status: 400 }
        );
      }

      const services = getServices();
      await services.user.updateUser(userId, { units: body.units } as never);

      return NextResponse.json({
        success: true,
        message: 'Units updated successfully',
      });
    }

    // Handle profile section update (placeholder for now)
    if (body.section && body.content !== undefined) {
      // TODO: Implement profile section updates
      // This would involve parsing the current profile, updating the section,
      // and saving a new profile version
      return NextResponse.json({
        success: true,
        message: 'Profile section update not yet implemented',
      });
    }

    return NextResponse.json(
      { success: false, message: 'No valid update data provided' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
