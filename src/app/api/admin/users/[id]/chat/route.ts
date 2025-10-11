import { UserRepository } from '@/server/repositories/userRepository';
import { chatService, conversationService, messageService } from '@/server/services';
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

    // Use MessageService to handle the inbound message flow
    const result = await messageService.receiveMessage({
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
      },
      responseGenerator: (user, content, conversationId) =>
        chatService.handleIncomingMessage(user, content, conversationId)
    });

    // Return JSON response instead of TwiML
    return NextResponse.json({
      success: true,
      data: {
        response: result.response || '',
        conversationId: result.conversationId,
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

// GET endpoint to fetch conversation history
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

    // Get conversation history
    const conversations = await conversationService.getConversationHistory(userId);

    // Fetch messages for each conversation
    const conversationsWithMessages = await Promise.all(
      conversations.map(async (conversation) => {
        const messages = await conversationService.getMessages(conversation.id);
        return {
          ...conversation,
          messages
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        conversations: conversationsWithMessages,
      }
    });
  } catch (error) {
    console.error('Error fetching conversation history:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch conversation history' },
      { status: 500 }
    );
  }
}
