import { NextRequest, NextResponse } from 'next/server'
import { fitnessPlanService } from '@/server/services'

export async function GET(
  _request: NextRequest,
  { params }:  { params: Promise<{ id: string }> }
) {
  try {
    const userId = (await params).id
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      )
    }

    const fitnessPlan = await fitnessPlanService.getCurrentPlan(userId)

    if (!fitnessPlan) {
      return NextResponse.json(
        { success: false, message: 'No fitness plan found for this user' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: fitnessPlan
    })
  } catch (error) {
    console.error('Error fetching fitness plan:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}