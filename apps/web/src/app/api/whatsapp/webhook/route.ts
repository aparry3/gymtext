import { getServices } from '@/lib/context';
import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

const STOP_KEYWORDS = ['STOP', 'STOPALL', 'UNSUBSCRIBE', 'CANCEL', 'END', 'QUIT'];
const START_KEYWORDS = ['START', 'UNSTOP', 'RESUME'];

function isStopCommand(message: string): boolean {
  return STOP_KEYWORDS.includes(message.trim().toUpperCase());
}

function isStartCommand(message: string): boolean {
  return START_KEYWORDS.includes(message.trim().toUpperCase());
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
      twiml.message('Sign up now! https://www.gymtext.co/');
      return new NextResponse(twiml.toString(), {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    const userWithProfile = await services.user.getUser(user.id);

    if (!userWithProfile) {
      twiml.message('Sorry, I had trouble loading your profile.');
      return new NextResponse(twiml.toString(), {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    // Handle STOP/START commands (same as SMS)
    if (isStopCommand(incomingMessage)) {
      const result = await services.subscription.cancelSubscription(user.id);
      
      await services.message.storeInboundMessage({
        clientId: user.id,
        from,
        to,
        content: incomingMessage,
        twilioData: body,
      });

      let confirmationMessage: string;
      if (result.success && result.periodEndDate) {
        const formattedDate = result.periodEndDate.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
        });
        confirmationMessage = `You've been unsubscribed from GymText. You'll have access until ${formattedDate}. Reply START anytime to reactivate.`;
      } else {
        confirmationMessage = `Sorry, there was an issue. Please contact support.`;
      }

      await services.messagingOrchestrator.sendImmediate(
        userWithProfile,
        confirmationMessage,
        undefined,
        'whatsapp'
      );

      twiml.message('');
      return new NextResponse(twiml.toString(), {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    if (isStartCommand(incomingMessage)) {
      const result = await services.subscription.reactivateSubscription(user.id);
      
      await services.message.storeInboundMessage({
        clientId: user.id,
        from,
        to,
        content: incomingMessage,
        twilioData: body,
      });

      let confirmationMessage = 'Welcome back to GymText!';
      if (result.requiresNewSubscription && result.checkoutUrl) {
        confirmationMessage = `Your subscription has ended. Resubscribe here: ${result.checkoutUrl}`;
      }

      await services.messagingOrchestrator.sendImmediate(
        userWithProfile,
        confirmationMessage,
        undefined,
        'whatsapp'
      );

      twiml.message('');
      return new NextResponse(twiml.toString(), {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      });
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

    return new NextResponse(twiml.toString(), {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    });
  } catch (error) {
    console.error('Error processing WhatsApp webhook:', error);
    
    const MessagingResponse = twilio.twiml.MessagingResponse;
    const twiml = new MessagingResponse();
    twiml.message('Sorry, something went wrong. Please try again later.');

    return new NextResponse(twiml.toString(), {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    });
  }
}
