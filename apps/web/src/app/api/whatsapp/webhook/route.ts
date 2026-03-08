import { getServices } from '@/lib/context';
import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import {
  STOP_CONFIRMATION,
  STOP_ERROR,
  START_REACTIVATED,
  START_REQUIRES_NEW_SUB,
  START_ERROR,
  HELP_MESSAGE,
  UNKNOWN_USER_MESSAGE,
} from '@gymtext/shared/server';

const STOP_KEYWORDS = ['STOP', 'STOPALL', 'UNSUBSCRIBE', 'CANCEL', 'END', 'QUIT'];
const START_KEYWORDS = ['START', 'UNSTOP', 'RESUME'];
const HELP_KEYWORDS = ['HELP', 'INFO', 'SUPPORT'];

function isStopCommand(message: string): boolean {
  return STOP_KEYWORDS.includes(message.trim().toUpperCase());
}

function isStartCommand(message: string): boolean {
  return START_KEYWORDS.includes(message.trim().toUpperCase());
}

function isHelpCommand(message: string): boolean {
  return HELP_KEYWORDS.includes(message.trim().toUpperCase());
}

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

    // Handle STOP command - cancel subscription and opt out of messaging
    if (isStopCommand(incomingMessage)) {
      await services.message.storeInboundMessage({
        clientId: user.id,
        from,
        to,
        content: incomingMessage,
        twilioData: body,
        messageType: 'keyword',
      });

      await services.user.updateUser(user.id, {
        messagingOptIn: false,
        messagingOptInDate: null,
      });

      const result = await services.subscription.cancelSubscription(user.id);

      let confirmationMessage: string;
      if (result.success && result.periodEndDate) {
        const formattedDate = result.periodEndDate.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
        });
        confirmationMessage = STOP_CONFIRMATION.replace('{periodEndDate}', formattedDate);
      } else {
        confirmationMessage = STOP_ERROR;
      }

      // WhatsApp requires sendImmediate (TwiML may not reliably deliver for WhatsApp)
      await services.messagingOrchestrator.sendImmediate(
        userWithProfile,
        confirmationMessage,
        undefined,
        'whatsapp',
        'keyword'
      );

      twiml.message('');
      return twimlResponse(twiml);
    }

    // Handle START command - reactivate subscription and opt in to messaging
    if (isStartCommand(incomingMessage)) {
      await services.message.storeInboundMessage({
        clientId: user.id,
        from,
        to,
        content: incomingMessage,
        twilioData: body,
        messageType: 'keyword',
      });

      await services.user.updateUser(user.id, {
        messagingOptIn: true,
        messagingOptInDate: new Date(),
      });

      const result = await services.subscription.reactivateSubscription(user.id);

      let confirmationMessage: string;
      if (result.success && result.reactivated) {
        confirmationMessage = START_REACTIVATED;
      } else if (result.requiresNewSubscription && result.checkoutUrl) {
        confirmationMessage = START_REQUIRES_NEW_SUB.replace('{checkoutUrl}', result.checkoutUrl);
      } else {
        confirmationMessage = START_ERROR;
      }

      await services.messagingOrchestrator.sendImmediate(
        userWithProfile,
        confirmationMessage,
        undefined,
        'whatsapp',
        'keyword'
      );

      twiml.message('');
      return twimlResponse(twiml);
    }

    // Handle HELP command (10DLC compliance)
    if (isHelpCommand(incomingMessage)) {
      await services.message.storeInboundMessage({
        clientId: user.id,
        from,
        to,
        content: incomingMessage,
        twilioData: body,
        messageType: 'keyword',
      });

      await services.messagingOrchestrator.sendImmediate(
        userWithProfile,
        HELP_MESSAGE,
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
