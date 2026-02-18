import { getServices } from '@/lib/context';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const body = Object.fromEntries(formData);

    const messageSid = body.MessageSid as string;
    const status = body.MessageStatus as string;
    const errorCode = body.ErrorCode as string | undefined;
    const errorMessage = body.ErrorMessage as string | undefined;

    console.log('[WhatsApp Status Webhook]', {
      messageSid,
      status,
      errorCode,
      errorMessage,
    });

    const services = getServices();

    // Handle delivery confirmation or failure
    if (status === 'delivered' || status === 'read') {
      await services.messagingOrchestrator.handleDeliveryConfirmation(messageSid);
    } else if (status === 'failed' || status === 'undelivered') {
      await services.messagingOrchestrator.handleDeliveryFailure(
        messageSid,
        errorMessage || errorCode
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing WhatsApp status webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process status webhook' },
      { status: 500 }
    );
  }
}
