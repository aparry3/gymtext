import { NextRequest, NextResponse } from 'next/server'
import { workoutInstanceService } from '@/server/services'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = (await params).id
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      )
    }
    
    // If filtering by date range (for microcycle week view)
    const startDateParam = searchParams.get('startDate')
    const endDateParam = searchParams.get('endDate')
    
    if (startDateParam && endDateParam) {
      const startDate = new Date(startDateParam)
      const endDate = new Date(endDateParam)
      
      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        const workouts = await workoutInstanceService.getWorkoutsByDateRange(userId, startDate, endDate)
        return NextResponse.json({
          success: true,
          data: workouts
        })
      }
    }

    // Otherwise, get recent workouts
    const workouts = await workoutInstanceService.getRecentWorkouts(userId, limit)

    return NextResponse.json({
      success: true,
      data: workouts
    })
  } catch (error) {
    console.error('Error fetching workouts:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}