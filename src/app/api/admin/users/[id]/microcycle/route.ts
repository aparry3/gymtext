import { NextRequest, NextResponse } from 'next/server'
import { microcycleService } from '@/server/services'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = (await params).id
    const { searchParams } = new URL(request.url)
    const mesocycleIndex = searchParams.get('mesocycleIndex')
    const weekNumber = searchParams.get('weekNumber')
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      )
    }

    if (mesocycleIndex === null || weekNumber === null) {
      return NextResponse.json(
        { success: false, message: 'Mesocycle index and week number are required' },
        { status: 400 }
      )
    }

    const mesocycleIdx = parseInt(mesocycleIndex, 10)
    const week = parseInt(weekNumber, 10)

    if (isNaN(mesocycleIdx) || isNaN(week)) {
      return NextResponse.json(
        { success: false, message: 'Invalid mesocycle index or week number' },
        { status: 400 }
      )
    }

    const microcycle = await microcycleService.getMicrocycleByWeek(userId, mesocycleIdx, week)

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