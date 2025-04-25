import { getUserByPhoneNumber } from '@/server/db/postgres/users';
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
    
    // Extract message content
    const incomingMessage = body.Body as string || '';

    const from = body.From as string || '';

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
    
    
    
    // Logic based on the message content
    twiml.message(
      `${user.name} said: ${incomingMessage}`
    );
    
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
