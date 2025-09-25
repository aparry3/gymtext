import { NextRequest, NextResponse } from 'next/server';
import { UserRepository } from '@/server/repositories/userRepository';
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
    const userRepository = new UserRepository();
    const user = await userRepository.findWithProfile(id);
    
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
      success: true, 
      message: messageResult.messageText 
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