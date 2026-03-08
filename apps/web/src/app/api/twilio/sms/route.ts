import { getServices } from '@/lib/context';
import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import { getTwilioSecrets } from '@/server/config';
import {
  STOP_CONFIRMATION,
  STOP_ALREADY_INACTIVE,
  STOP_ERROR,
  START_REACTIVATED,
  START_ALREADY_ACTIVE,
  START_REQUIRES_NEW_SUB,
  START_NO_ACCOUNT,
  START_ERROR,
  HELP_MESSAGE,
  UNKNOWN_USER_MESSAGE,
} from '@gymtext/shared/server';

// Keywords for subscription management (case-insensitive)
const STOP_KEYWORDS = ['STOP', 'STOPALL', 'UNSUBSCRIBE', 'CANCEL', 'END', 'QUIT'];
const START_KEYWORDS = ['START', 'UNSTOP', 'RESUME'];
const HELP_KEYWORDS = ['HELP', 'INFO', 'SUPPORT'];

function isStopCommand(message: string): boolean {
  const normalized = message.trim().toUpperCase();
  return STOP_KEYWORDS.includes(normalized);
}

function isStartCommand(message: string): boolean {
  const normalized = message.trim().toUpperCase();
  return START_KEYWORDS.includes(normalized);
}

function isHelpCommand(message: string): boolean {
  const normalized = message.trim().toUpperCase();
  return HELP_KEYWORDS.includes(normalized);
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

    const incomingMessage = body.Body as string || '';
    const from = body.From as string || '';
    const to = body.To as string || getTwilioSecrets().phoneNumber;

    const services = getServices();
    const user = await services.user.getUserByPhone(from);

    if (!user) {
      twiml.message(UNKNOWN_USER_MESSAGE);
      return twimlResponse(twiml);
    }

    const userWithProfile = await services.user.getUser(user.id);

    if (!userWithProfile) {
      twiml.message('Sorry, I had trouble loading your profile. Please try again later.');
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

      // Set messaging opt-in to false
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
      } else if (result.error === 'No active subscription found') {
        confirmationMessage = STOP_ALREADY_INACTIVE;
      } else {
        confirmationMessage = STOP_ERROR;
      }

      await services.message.storeOutboundMessage({
        clientId: user.id,
        to: from,
        content: confirmationMessage,
        deliveryStatus: 'sent',
        messageType: 'keyword',
      });

      twiml.message(confirmationMessage);
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

      // Set messaging opt-in to true
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
      } else if (result.success && !result.requiresNewSubscription && !result.reactivated) {
        confirmationMessage = START_ALREADY_ACTIVE;
      } else {
        confirmationMessage = START_ERROR;
      }

      await services.message.storeOutboundMessage({
        clientId: user.id,
        to: from,
        content: confirmationMessage,
        deliveryStatus: 'sent',
        messageType: 'keyword',
      });

      twiml.message(confirmationMessage);
      return twimlResponse(twiml);
    }

    // Handle HELP command - provide support info (10DLC compliance)
    if (isHelpCommand(incomingMessage)) {
      await services.message.storeInboundMessage({
        clientId: user.id,
        from,
        to,
        content: incomingMessage,
        twilioData: body,
        messageType: 'keyword',
      });

      await services.message.storeOutboundMessage({
        clientId: user.id,
        to: from,
        content: HELP_MESSAGE,
        deliveryStatus: 'sent',
        messageType: 'keyword',
      });

      twiml.message(HELP_MESSAGE);
      return twimlResponse(twiml);
    }

    // Use MessageService to ingest the message (async via Inngest)
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
    console.error('Error processing SMS webhook:', error);

    const MessagingResponse = twilio.twiml.MessagingResponse;
    const twiml = new MessagingResponse();
    twiml.message('Sorry, something went wrong. Please try again later.');

    return twimlResponse(twiml);
  }
}
