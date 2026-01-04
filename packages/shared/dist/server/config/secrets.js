/**
 * Server Secrets
 *
 * Grouped accessors for secret environment variables.
 * All secrets are validated at import time via getServerEnv().
 */
import { getServerEnv } from './env';
// =============================================================================
// Database Secrets
// =============================================================================
export function getDatabaseSecrets() {
    const env = getServerEnv();
    return {
        databaseUrl: env.DATABASE_URL,
        sessionEncryptionKey: env.SESSION_ENCRYPTION_KEY,
    };
}
// =============================================================================
// Twilio Secrets
// =============================================================================
export function getTwilioSecrets() {
    const env = getServerEnv();
    return {
        accountSid: env.TWILIO_ACCOUNT_SID,
        authToken: env.TWILIO_AUTH_TOKEN,
        phoneNumber: env.TWILIO_NUMBER,
    };
}
// =============================================================================
// Stripe Secrets
// =============================================================================
export function getStripeSecrets() {
    const env = getServerEnv();
    return {
        secretKey: env.STRIPE_SECRET_KEY,
        // webhookSecret may be undefined in development, but required for webhook route
        webhookSecret: env.STRIPE_WEBHOOK_SECRET,
    };
}
// =============================================================================
// AI Secrets
// Note: LangChain auto-reads OPENAI_API_KEY and GOOGLE_API_KEY from process.env.
// We expose them here for cases where direct access is needed (e.g., GoogleGenAI SDK).
// =============================================================================
export function getAiSecrets() {
    const env = getServerEnv();
    return {
        openaiApiKey: env.OPENAI_API_KEY,
        googleApiKey: env.GOOGLE_API_KEY,
        xaiApiKey: env.XAI_API_KEY,
    };
}
// =============================================================================
// Pinecone Secrets
// =============================================================================
export function getPineconeSecrets() {
    const env = getServerEnv();
    return {
        apiKey: env.PINECONE_API_KEY,
        indexName: env.PINECONE_INDEX,
    };
}
// =============================================================================
// Background Job Secrets
// =============================================================================
export function getCronSecrets() {
    const env = getServerEnv();
    return {
        cronSecret: env.CRON_SECRET,
        inngestEventKey: env.INNGEST_EVENT_KEY,
        inngestSigningKey: env.INNGEST_SIGNING_KEY,
    };
}
