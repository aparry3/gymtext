import { getUserByPhoneNumber } from '@/server/db/postgres/users';
import { getUserWithProfile } from '@/server/db/postgres/users';
import { generateChatResponse } from '@/server/services/chat';
import { ConversationStorageService } from '@/server/services/conversationStorage';
import { db } from '@/server/clients/dbClient';
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

    const user = await getUserByPhoneNumber(from);

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
    const userWithProfile = await getUserWithProfile(user.id);
    
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
    const conversationStorage = new ConversationStorageService(db);
    
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
      const stored = await conversationStorage.storeOutboundMessage({
        userId: user.id,
        from: to, // Our Twilio number is the from
        to: from, // User's number is the to
        content: chatResponse
      });
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
