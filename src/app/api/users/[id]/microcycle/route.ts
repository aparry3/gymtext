import { NextRequest, NextResponse } from 'next/server'
import { microcycleService, fitnessPlanService } from '@/server/services'
import { checkAuthorization } from '@/server/utils/authMiddleware'

/**
 * GET /api/users/[id]/microcycle
 *
 * Get microcycle by absolute week number
 *
 * Query params:
 * - absoluteWeek: Week number from plan start (1-indexed)
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

    const { searchParams } = new URL(request.url)
    const absoluteWeekParam = searchParams.get('absoluteWeek')

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      )
    }

    if (absoluteWeekParam === null) {
      return NextResponse.json(
        { success: false, message: 'absoluteWeek is required' },
        { status: 400 }
      )
    }

    const absoluteWeek = parseInt(absoluteWeekParam, 10)

    if (isNaN(absoluteWeek) || absoluteWeek < 1) {
      return NextResponse.json(
        { success: false, message: 'Invalid absolute week number (must be >= 1)' },
        { status: 400 }
      )
    }

    // Get the user's current plan
    const plan = await fitnessPlanService.getCurrentPlan(userId)
    if (!plan || !plan.id) {
      return NextResponse.json(
        { success: false, message: 'No fitness plan found for user' },
        { status: 404 }
      )
    }

    const microcycle = await microcycleService.getMicrocycleByAbsoluteWeek(userId, plan.id, absoluteWeek)

    if (!microcycle) {
      return NextResponse.json(
        { success: false, message: 'Microcycle not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: microcycle
    })
  } catch (error) {
    console.error('Error fetching microcycle:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
