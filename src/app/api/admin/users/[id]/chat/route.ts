import { UserRepository } from '@/server/repositories/userRepository';
import { messageService } from '@/server/services';
import { NextRequest, NextResponse } from 'next/server';

interface ChatRequestBody {
  message: string;
  userId: string;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { message } = await req.json() as ChatRequestBody;
    const { id: userId } = await params;

    if (!message || !userId) {
      return NextResponse.json(
        { success: false, error: 'Message and userId are required' },
        { status: 400 }
      );
    }

    const userRepository = new UserRepository();
    const user = await userRepository.findById(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user with profile for chat context
    const userWithProfile = await userRepository.findWithProfile(user.id);

    if (!userWithProfile) {
      return NextResponse.json(
        { success: false, error: 'Failed to load user profile' },
        { status: 500 }
      );
    }

    // For admin chat, we'll use placeholder phone numbers
    const adminFrom = user.phoneNumber; // Simulating user's phone
    const adminTo = process.env.TWILIO_NUMBER || '+10000000000'; // Simulating our number

    // Use MessageService to ingest the message (async via Inngest)
    // This matches the production SMS flow for accurate testing
    const result = await messageService.ingestMessage({
      user: userWithProfile,
      content: message,
      from: adminFrom,
      to: adminTo,
      twilioData: {
        // Minimal Twilio data for admin chat
        MessageSid: `admin-${Date.now()}`,
        From: adminFrom,
        To: adminTo,
        Body: message,
      }
    });

    // Return acknowledgment immediately (like SMS webhook)
    // The actual response will be delivered via SSE when Inngest processes it
    return NextResponse.json({
      success: true,
      data: {
        jobId: result.jobId,
        ackMessage: result.ackMessage,
        timestamp: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error('Error processing admin chat:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process message' },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch message history
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    const userRepository = new UserRepository();
    const user = await userRepository.findById(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get message history (flat list, no conversation grouping)
    const messages = await messageService.getMessages(userId, 100); // Get last 100 messages

    return NextResponse.json({
      success: true,
      data: {
        messages,
      }
    });
  } catch (error) {
    console.error('Error fetching message history:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch message history' },
      { status: 500 }
    );
  }
}
