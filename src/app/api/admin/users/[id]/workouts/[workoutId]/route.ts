import { NextRequest, NextResponse } from 'next/server'
import { workoutInstanceService } from '@/server/services'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; workoutId: string }> }
) {
  try {
    const { id: userId, workoutId } = await params

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      )
    }

    if (!workoutId) {
      return NextResponse.json(
        { success: false, message: 'Workout ID is required' },
        { status: 400 }
      )
    }

    const workout = await workoutInstanceService.getWorkoutById(workoutId, userId)

    if (!workout) {
      return NextResponse.json(
        { success: false, message: 'Workout not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: workout
    })
  } catch (error) {
    console.error('Error fetching workout:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; workoutId: string }> }
) {
  try {
    const { id: userId, workoutId } = await params

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      )
    }

    if (!workoutId) {
      return NextResponse.json(
        { success: false, message: 'Workout ID is required' },
        { status: 400 }
      )
    }

    const deleted = await workoutInstanceService.deleteWorkout(workoutId, userId)

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Workout not found or already deleted' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Workout deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting workout:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}