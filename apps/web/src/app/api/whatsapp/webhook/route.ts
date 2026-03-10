import { getServices } from '@/lib/context';
import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import { UNKNOWN_USER_MESSAGE } from '@gymtext/shared/server';

function twimlResponse(twiml: twilio.twiml.MessagingResponse): NextResponse {
  return new NextResponse(twiml.toString(), {
    status: 200,
    headers: { 'Content-Type': 'text/xml' },
  });
}

export async function POST(req: NextRequest) {
  try {
    const MessagingResponse = twilio.twiml.MessagingResponse;
    const twiml = new MessagingResponse();

    const formData = await req.formData();
    const body = Object.fromEntries(formData);

    // WhatsApp numbers are prefixed: whatsapp:+15005550006
    const incomingMessage = body.Body as string || '';
    const from = body.From as string || ''; // whatsapp:+15005550006
    const to = body.To as string || '';

    console.log('[WhatsApp Webhook] Received message from:', from);

    // Strip whatsapp: prefix to lookup user
    const phoneNumber = from.replace('whatsapp:', '');

    const services = getServices();
    const user = await services.user.getUserByPhone(phoneNumber);

    if (!user) {
      twiml.message(UNKNOWN_USER_MESSAGE);
      return twimlResponse(twiml);
    }

    const userWithProfile = await services.user.getUser(user.id);

    if (!userWithProfile) {
      twiml.message('Sorry, I had trouble loading your profile.');
      return twimlResponse(twiml);
    }

    // Handle keyword commands (STOP/START/HELP)
    const keywordResult = await services.message.handleKeyword({
      user: userWithProfile, content: incomingMessage, from, to, twilioData: body,
    });
    if (keywordResult.handled) {
      await services.messagingOrchestrator.sendImmediate(
        userWithProfile,
        keywordResult.responseMessage!,
        undefined,
        'whatsapp',
        'keyword'
      );
      twiml.message('');
      return twimlResponse(twiml);
    }

    // Ingest message for chat agent processing
    const result = await services.message.ingestMessage({
      user: userWithProfile,
      content: incomingMessage,
      from,
      to,
      twilioData: body
    });

    twiml.message(result.ackMessage);
    return twimlResponse(twiml);
  } catch (error) {
    console.error('Error processing WhatsApp webhook:', error);

    const MessagingResponse = twilio.twiml.MessagingResponse;
    const twiml = new MessagingResponse();
    twiml.message('Sorry, something went wrong. Please try again later.');

    return twimlResponse(twiml);
  }
}
