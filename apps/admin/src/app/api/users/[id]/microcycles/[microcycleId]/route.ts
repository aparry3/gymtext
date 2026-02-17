import { NextRequest, NextResponse } from 'next/server'
import { getAdminContext } from '@/lib/context'
import { checkAuthorization } from '@/server/utils/authMiddleware'

/**
 * GET /api/users/[id]/microcycles/[microcycleId]
 *
 * Get a single microcycle with its associated workouts
 *
 * Authorization:
 * - Admin can access any user
 * - Regular user can only access their own data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; microcycleId: string }> }
) {
  try {
    const { id: userId, microcycleId } = await params

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

    if (!microcycleId) {
      return NextResponse.json(
        { success: false, message: 'Microcycle ID is required' },
        { status: 400 }
      )
    }

    const { services } = await getAdminContext()

    // Get the microcycle
    const microcycle = await services.microcycle.getMicrocycleById(microcycleId)

    if (!microcycle) {
      return NextResponse.json(
        { success: false, message: 'Microcycle not found' },
        { status: 404 }
      )
    }

    // Verify the microcycle belongs to the user
    if (microcycle.clientId !== userId) {
      return NextResponse.json(
        { success: false, message: 'Microcycle does not belong to this user' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        microcycle,
        workouts: []
      }
    })
  } catch (error) {
    console.error('Error fetching microcycle:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
