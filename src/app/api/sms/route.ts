import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

export async function POST(req: NextRequest) {
  try {
    // Parse the form data from the request
    const formData = await req.formData();
    const body = Object.fromEntries(formData);
    
    // Extract message content
    const incomingMessage = body.Body as string || '';
    console.log(body);
    
    // Create a TwiML response
    const MessagingResponse = twilio.twiml.MessagingResponse;
    const twiml = new MessagingResponse();
    
    // Logic based on the message content
    twiml.message(
      `You said: ${incomingMessage}`
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
