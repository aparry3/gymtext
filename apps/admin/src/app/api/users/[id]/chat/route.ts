import { getAdminContext } from '@/lib/context';
import { NextRequest, NextResponse } from 'next/server';
import { getTwilioSecrets } from '@/server/config';

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

    const { services } = await getAdminContext();
    const user = await services.user.getUserById(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user with profile for chat context
    const userWithProfile = await services.user.getUser(user.id);

    if (!userWithProfile) {
      return NextResponse.json(
        { success: false, error: 'Failed to load user profile' },
        { status: 500 }
      );
    }

    // For admin chat, we'll use placeholder phone numbers
    const adminFrom = user.phoneNumber; // Simulating user's phone
    const adminTo = getTwilioSecrets().phoneNumber || '+10000000000'; // Simulating our number

    // Use MessageService to ingest the message (async via Inngest)
    // This matches the production SMS flow for accurate testing
    const result = await services.message.ingestMessage({
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

// GET endpoint to fetch message history with pagination
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    // Parse pagination params from query string
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100); // Max 100 per request
    const offset = parseInt(searchParams.get('offset') || '0');

    const { services } = await getAdminContext();
    const user = await services.user.getUserById(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get message history (returns DESC - latest first)
    const messages = await services.message.getMessages(userId, limit, offset);

    // Transform messages to match frontend interface
    // Frontend expects: { timestamp, from, to, ... }
    // Database has: { createdAt, phoneFrom, phoneTo, ... }
    const transformedMessages = messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      direction: msg.direction,
      timestamp: msg.createdAt instanceof Date ? msg.createdAt.toISOString() : msg.createdAt,
      from: msg.phoneFrom || '',
      to: msg.phoneTo || '',
    }));

    // Reverse to oldest-first for chat display
    const messagesForDisplay = transformedMessages.reverse();

    // Check if there are more messages
    const hasMore = messages.length === limit;

    return NextResponse.json({
      success: true,
      data: {
        messages: messagesForDisplay,
        pagination: {
          limit,
          offset,
          hasMore,
          count: messages.length,
        }
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
