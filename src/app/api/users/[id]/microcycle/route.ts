import { NextRequest, NextResponse } from 'next/server'
import { microcycleService, userService, fitnessPlanService, progressService } from '@/server/services'
import { checkAuthorization } from '@/server/utils/authMiddleware'

/**
 * GET /api/users/[id]/microcycle
 *
 * Get microcycle for the user
 *
 * Query params:
 * - absoluteWeek: (optional) Week number from plan start (1-indexed)
 *
 * If no params provided, returns current week's microcycle using user's timezone
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

    const { searchParams } = new URL(request.url)
    const absoluteWeekParam = searchParams.get('absoluteWeek')

    // If absoluteWeek provided, use it (existing behavior)
    if (absoluteWeekParam !== null) {
      const absoluteWeek = parseInt(absoluteWeekParam, 10)

      if (isNaN(absoluteWeek) || absoluteWeek < 1) {
        return NextResponse.json(
          { success: false, message: 'Invalid absolute week number (must be >= 1)' },
          { status: 400 }
        )
      }

      const microcycle = await microcycleService.getMicrocycleByAbsoluteWeek(userId, absoluteWeek)

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
    }

    // No params: return current week's microcycle using user's timezone
    const user = await userService.getUser(userId)
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    const plan = await fitnessPlanService.getCurrentPlan(userId)
    if (!plan) {
      return NextResponse.json(
        { success: false, message: 'No fitness plan found for user' },
        { status: 404 }
      )
    }

    const progress = await progressService.getCurrentProgress(plan, user.timezone)
    if (!progress) {
      return NextResponse.json(
        { success: false, message: 'Could not calculate current progress' },
        { status: 404 }
      )
    }

    const microcycle = await microcycleService.getMicrocycleByAbsoluteWeek(userId, progress.absoluteWeek)

    if (!microcycle) {
      return NextResponse.json(
        { success: false, message: 'Microcycle not found for current week' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        ...microcycle,
        absoluteWeek: progress.absoluteWeek
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
