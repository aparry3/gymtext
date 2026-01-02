import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/server/services/user/userService';
import { dailyMessageService } from '@/server/services';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: 'User ID is required'
        },
        { status: 400 }
      );
    }

    // Fetch the user from the database
    const user = await userService.getUser(id);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'User not found'
        },
        { status: 404 }
      );
    }

    const messageResult = await dailyMessageService.sendDailyMessage(user);

    return NextResponse.json({
      success: messageResult.success,
      messageId: messageResult.messageId,
      error: messageResult.error
    });
  } catch (error) {
    console.error('Error sending daily message:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      },
      { status: 500 }
    );
  }
}
