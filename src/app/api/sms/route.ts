import { UserRepository } from '@/server/repositories/userRepository';
import { messageService } from '@/server/services';
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

    // Use MessageService to ingest the message (async via Inngest)
    // This returns immediately with an ack, preventing Twilio webhook timeouts
    // The actual response will be sent by the Inngest processMessage function
    const result = await messageService.ingestMessage({
      user: userWithProfile,
      content: incomingMessage,
      from,
      to,
      twilioData: body
    });

    // Send immediate acknowledgment via TwiML
    twiml.message(result.ackMessage);

    // Return the TwiML response with the appropriate content type
    return new NextResponse(twiml.toString(), {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  } catch (error) {
    console.error('Error processing SMS webhook:', error);

    // Return error via TwiML
    const MessagingResponse = twilio.twiml.MessagingResponse;
    const twiml = new MessagingResponse();
    twiml.message('Sorry, something went wrong. Please try again later.');

    return new NextResponse(twiml.toString(), {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  }
}
