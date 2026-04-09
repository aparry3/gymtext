/**
 * Sends an auth verification code SMS, respecting the MESSAGING_PROVIDER
 * config so that local/dev environments never hit Twilio.
 *
 * When the provider is `local`, dispatches via the LocalMessagingClient
 * (visible in `pnpm local:sms`). Otherwise falls back to the injected
 * Twilio client.
 */
import type { ITwilioClient } from '@/server/connections/twilio/factory';
import { localMessagingClient } from '@/server/connections/messaging/localClient';
import { getMessagingConfig } from '@/shared/config';
import { MessageProvider } from '@/server/connections/messaging/types';
import type { UserWithProfile } from '@/server/models/user';

export async function sendAuthSms(
  twilioClient: ITwilioClient,
  phoneNumber: string,
  message: string
): Promise<void> {
  const { provider } = getMessagingConfig();

  if (provider === MessageProvider.LOCAL) {
    // LocalMessagingClient just needs phoneNumber + id for logging.
    const stubUser = { id: `auth:${phoneNumber}`, phoneNumber } as unknown as UserWithProfile;
    await localMessagingClient.sendMessage(stubUser, message);
    return;
  }

  await twilioClient.sendSMS(phoneNumber, message);
}
