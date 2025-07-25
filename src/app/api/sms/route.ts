import { UserRepository } from '@/server/repositories/userRepository';
import { generateChatResponse } from '@/server/services/chatService';
import { ConversationService } from '@/server/services/conversationService';
import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

export async function POST(req: NextRequest) {
  try {
    // Create a TwiML response
    const MessagingResponse = twilio.twiml.MessagingResponse;
    const twiml = new MessagingResponse();
    
    // Parse the form data from the request
    const formData = await req.formData();
    const body = Object.fromEntries(formData);
    
    // Extract message content and phone numbers
    const incomingMessage = body.Body as string || '';
    const from = body.From as string || '';
    const to = body.To as string || process.env.TWILIO_NUMBER || '';

    const userRepository = new UserRepository();
    const user = await userRepository.findByPhoneNumber(from);

    if (!user) {
        twiml.message(
            `Sign up now! https://www.gymtext.co/`
          );      
          return new NextResponse(twiml.toString(), {
            status: 200,
            headers: {
              'Content-Type': 'text/xml',
            },
          });
    }
    
    // Get user with profile for chat context
    const userWithProfile = await userRepository.findWithProfile(user.id);
    
    if (!userWithProfile) {
      twiml.message('Sorry, I had trouble loading your profile. Please try again later.');
      return new NextResponse(twiml.toString(), {
        status: 200,
        headers: {
          'Content-Type': 'text/xml',
        },
      });
    }
    
    // Initialize conversation storage service
    const conversationStorage = new ConversationService();
    
    // Store the inbound message (non-blocking)
    try {
      const stored = await conversationStorage.storeInboundMessage({
        userId: user.id,
        from,
        to,
        content: incomingMessage,
        twilioData: body
      });
      if (!stored) {
        console.warn('Circuit breaker prevented storing inbound message');
      }
    } catch (error) {
      // Log error but don't block SMS processing
      console.error('Failed to store inbound message:', error);
    }
    
    // Generate chat response using LLM
    const chatResponse = await generateChatResponse(userWithProfile, incomingMessage);
    
    // Store the outbound message (non-blocking)
    try {
      const stored = await conversationStorage.storeOutboundMessage(
        user.id,
        from, // User's number is the to
        chatResponse,
        to // Our Twilio number is the from
      );
      if (!stored) {
        console.warn('Circuit breaker prevented storing outbound message');
      }
    } catch (error) {
      // Log error but don't block SMS processing
      console.error('Failed to store outbound message:', error);
    }
    
    // Send the chat response
    twiml.message(chatResponse);
    
    // Return the TwiML response with the appropriate content type
    return new NextResponse(twiml.toString(), {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  } catch (error) {
    console.error('Error processing SMS webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process SMS' },
      { status: 500 }
    );
  }
}
