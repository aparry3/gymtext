import { userService } from '@/server/services/user/userService';
import { messageService, subscriptionService } from '@/server/services';
import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

// Keywords for subscription management (case-insensitive)
const STOP_KEYWORDS = ['STOP', 'STOPALL', 'UNSUBSCRIBE', 'CANCEL', 'END', 'QUIT'];
const START_KEYWORDS = ['START', 'YES', 'UNSTOP', 'RESUME'];

function isStopCommand(message: string): boolean {
  const normalized = message.trim().toUpperCase();
  return STOP_KEYWORDS.includes(normalized);
}

function isStartCommand(message: string): boolean {
  const normalized = message.trim().toUpperCase();
  return START_KEYWORDS.includes(normalized);
}

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

    const user = await userService.getUserByPhone(from);

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
    const userWithProfile = await userService.getUser(user.id);

    if (!userWithProfile) {
      twiml.message('Sorry, I had trouble loading your profile. Please try again later.');
      return new NextResponse(twiml.toString(), {
        status: 200,
        headers: {
          'Content-Type': 'text/xml',
        },
      });
    }

    // Handle STOP command - cancel subscription
    if (isStopCommand(incomingMessage)) {
      const result = await subscriptionService.cancelSubscription(user.id);

      // Store the inbound message for history
      await messageService.storeInboundMessage({
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
      } else if (result.error === 'No active subscription found') {
        confirmationMessage = `You don't have an active subscription. Visit gymtext.co to sign up!`;
      } else {
        confirmationMessage = `Sorry, there was an issue processing your request. Please try again or contact support.`;
      }

      // Send confirmation via direct message (not queued)
      await messageService.sendMessage(userWithProfile, confirmationMessage);

      // Return empty TwiML (confirmation sent separately)
      twiml.message('');
      return new NextResponse(twiml.toString(), {
        status: 200,
        headers: {
          'Content-Type': 'text/xml',
        },
      });
    }

    // Handle START command - reactivate subscription
    if (isStartCommand(incomingMessage)) {
      const result = await subscriptionService.reactivateSubscription(user.id);

      // Store the inbound message for history
      await messageService.storeInboundMessage({
        clientId: user.id,
        from,
        to,
        content: incomingMessage,
        twilioData: body,
      });

      let confirmationMessage: string;
      if (result.success && result.reactivated) {
        confirmationMessage = `Welcome back! Your GymText subscription has been reactivated. You'll receive your next workout soon.`;
      } else if (result.requiresNewSubscription && result.checkoutUrl) {
        confirmationMessage = `Your subscription has ended. Resubscribe here: ${result.checkoutUrl}`;
      } else if (result.success && !result.requiresNewSubscription && !result.reactivated) {
        confirmationMessage = `Your subscription is already active! Reply with any question to continue.`;
      } else {
        confirmationMessage = `Sorry, there was an issue processing your request. Visit gymtext.co to subscribe.`;
      }

      // Send confirmation via direct message (not queued)
      await messageService.sendMessage(userWithProfile, confirmationMessage);

      // Return empty TwiML (confirmation sent separately)
      twiml.message('');
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
