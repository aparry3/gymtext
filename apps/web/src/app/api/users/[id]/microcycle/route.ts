import { NextRequest, NextResponse } from 'next/server'
import { getServices } from '@/lib/context'
import { checkAuthorization } from '@/server/utils/authMiddleware'

/**
 * GET /api/users/[id]/microcycle
 *
 * Get microcycle for the user
 *
 * Query params:
 * - absoluteWeek: (optional) Week number from plan start (1-indexed).
 *   Calculates a target date from the plan's start date and looks up by date.
 *
 * If no params provided, returns the latest microcycle for the user.
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

    const services = getServices()

    // If absoluteWeek param provided, calculate date from plan
    if (absoluteWeekParam !== null) {
      const absoluteWeek = parseInt(absoluteWeekParam, 10)

      if (isNaN(absoluteWeek) || absoluteWeek < 1) {
        return NextResponse.json(
          { success: false, message: 'Invalid absolute week number' },
          { status: 400 }
        )
      }

      const plan = await services.fitnessPlan.getCurrentPlan(userId)
      if (!plan) {
        return NextResponse.json(
          { success: false, message: 'No fitness plan found' },
          { status: 404 }
        )
      }

      // Calculate target date: plan start + (week-1) * 7 days
      const targetDate = new Date(plan.startDate)
      targetDate.setDate(targetDate.getDate() + (absoluteWeek - 1) * 7)

      const microcycle = await services.microcycle.getMicrocycleByDate(userId, targetDate)

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

    // No params: current week
    const microcycle = await services.microcycle.getLatestMicrocycle(userId)

    if (!microcycle) {
      return NextResponse.json(
        { success: false, message: 'No microcycle found' },
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
