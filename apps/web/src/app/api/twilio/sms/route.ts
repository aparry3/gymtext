import { getServices, getRepositories } from '@/lib/context';
import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import { getTwilioSecrets } from '@/server/config';
import { UNKNOWN_USER_MESSAGE } from '@gymtext/shared/server';
import { getAdminConfig } from '@gymtext/shared/shared';

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
    const repos = getRepositories();
    let user = await services.user.getUserByPhone(from);

    // If no direct match and sender is an admin phone, check for active test identity
    if (!user) {
      const { phoneNumbers } = getAdminConfig();
      if (phoneNumbers.includes(from)) {
        const activeTestUserId = await repos.adminTestRouting.getActiveTestUserId(from);
        if (activeTestUserId) {
          user = await services.user.getUserById(activeTestUserId);
        }
      }
    }

    if (!user) {
      twiml.message(UNKNOWN_USER_MESSAGE);
      return twimlResponse(twiml);
    }

    const userWithProfile = await services.user.getUser(user.id);

    if (!userWithProfile) {
      twiml.message('Sorry, I had trouble loading your profile. Please try again later.');
      return twimlResponse(twiml);
    }

    // Handle keyword commands (STOP/START/HELP)
    const keywordResult = await services.message.handleKeyword({
      user: userWithProfile, content: incomingMessage, from, to, twilioData: body,
    });
    if (keywordResult.handled) {
      await services.message.storeOutboundMessage({
        clientId: user.id,
        to: from,
        content: keywordResult.responseMessage!,
        deliveryStatus: 'sent',
        messageType: 'keyword',
      });
      twiml.message(keywordResult.responseMessage!);
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
