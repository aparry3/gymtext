import { NextRequest, NextResponse } from 'next/server'
import { getAdminContext } from '@/lib/context'
import { checkAuthorization } from '@/server/utils/authMiddleware'

/**
 * GET /api/users/[id]/microcycles
 *
 * Get all microcycles for a user
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
    const userId = (await params).id

    // Check authorization - admin or authenticated user accessing their own data
    const auth = checkAuthorization(request, userId)
    if (!auth.isAuthorized) {
      return NextResponse.json(
        { success: false, message: auth.error || 'Unauthorized' },
        { status: 403 }
      )
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get all microcycles for the user
    const { services } = await getAdminContext()
    const microcycles = await services.microcycle.getAllMicrocycles(userId)

    return NextResponse.json({
      success: true,
      data: microcycles
    })
  } catch (error) {
    console.error('Error fetching microcycles:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
