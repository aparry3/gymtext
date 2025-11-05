import { NextRequest, NextResponse } from 'next/server'
import { microcycleService } from '@/server/services'
import { checkAuthorization } from '@/server/utils/authMiddleware'

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
    const mesocycleIndex = searchParams.get('mesocycleIndex')

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      )
    }

    let microcycles
    if (mesocycleIndex !== null) {
      const index = parseInt(mesocycleIndex, 10)
      if (isNaN(index)) {
        return NextResponse.json(
          { success: false, message: 'Invalid mesocycle index' },
          { status: 400 }
        )
      }
      microcycles = await microcycleService.getMicrocyclesByMesocycleIndex(userId, index)
    } else {
      microcycles = await microcycleService.getAllMicrocycles(userId)
    }

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
