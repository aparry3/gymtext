/**
 * Twilio Connection
 *
 * This module provides the default Twilio client using environment
 * variables. For environment switching (sandbox/production), use
 * the factory functions instead.
 */
import { getTwilioSecrets } from '@/server/config';
import { getUrlsConfig } from '@/shared/config';
import { createTwilioClient } from './factory';
// Get credentials from validated server config
const credentials = getTwilioSecrets();
// Build status callback URL if BASE_URL is configured
const { baseUrl } = getUrlsConfig();
const statusCallbackUrl = baseUrl ? `${baseUrl}/api/twilio/status` : undefined;
// Create default Twilio client using factory
export const twilioClient = createTwilioClient({
    accountSid: credentials.accountSid,
    authToken: credentials.authToken,
    phoneNumber: credentials.phoneNumber,
}, statusCallbackUrl);
// Re-export factory functions and types for environment switching
export { createTwilioClient, clearTwilioClients, getActiveTwilioAccounts, } from './factory';
