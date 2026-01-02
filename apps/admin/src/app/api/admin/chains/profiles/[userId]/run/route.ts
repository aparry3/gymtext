import { NextResponse } from 'next/server';
import { ChainRunnerService } from '@/server/services';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: 'User ID is required',
        },
        { status: 400 }
      );
    }

    const chainRunnerService = ChainRunnerService.getInstance();
    const result = await chainRunnerService.runProfileRegeneration(userId);

    return NextResponse.json({
      success: true,
      data: {
        profile: result.profile,
      },
      executionTimeMs: result.executionTimeMs,
    });
  } catch (error) {
    console.error('Error regenerating profile:', error);

    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json(
          {
            success: false,
            message: error.message,
          },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred regenerating the profile',
      },
      { status: 500 }
    );
  }
}
