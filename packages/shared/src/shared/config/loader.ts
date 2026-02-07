import { AppConfigSchema, type AppConfig, type MessagingProvider } from './schema';

export type Environment = 'development' | 'staging' | 'production';

/**
 * Determine current environment.
 * APP_ENV can override NODE_ENV (useful for staging which isn't a Node concept).
 */
export function getEnvironment(): Environment {
  const appEnv = process.env.APP_ENV;
  const nodeEnv = process.env.NODE_ENV;

  if (appEnv === 'staging') return 'staging';
  if (nodeEnv === 'production') return 'production';
  return 'development';
}

/**
 * Parse comma-separated phone numbers from env var.
 */
function parsePhoneNumbers(envValue: string | undefined): string[] {
  if (!envValue) return [];
  return envValue
    .split(',')
    .map((num) => num.trim())
    .filter((num) => num.length > 0);
}

/**
 * Parse optional integer from env var.
 */
function parseOptionalInt(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? undefined : parsed;
}

/**
 * Parse optional boolean from env var.
 * Treats 'true' as true, 'false' as false, undefined as undefined.
 */
function parseOptionalBool(value: string | undefined): boolean | undefined {
  if (value === undefined) return undefined;
  return value === 'true';
}

/**
 * Load and validate configuration.
 * Builds config from env vars, letting Zod schemas handle defaults.
 * Throws on validation failure (fail-fast).
 */
export function loadConfig(): AppConfig {
  const env = getEnvironment();

  // Build raw config from env vars - undefined values let Zod defaults apply
  const rawConfig = {
    environment: env,
    context: {
      messageHistoryLimit: parseOptionalInt(process.env.CONTEXT_MESSAGE_HISTORY_LIMIT),
      includeSystemMessages: parseOptionalBool(process.env.CONTEXT_INCLUDE_SYSTEM_MESSAGES),
      maxContextTokens: parseOptionalInt(process.env.CONTEXT_MAX_TOKENS),
      reserveTokensForResponse: parseOptionalInt(process.env.CONTEXT_RESERVE_TOKENS),
      conversationGapMinutes: parseOptionalInt(process.env.CONTEXT_CONVERSATION_GAP_MINUTES),
      enableCaching: parseOptionalBool(process.env.CONTEXT_ENABLE_CACHING),
      cacheTTLSeconds: parseOptionalInt(process.env.CONTEXT_CACHE_TTL),
    },
    chat: {
      smsMaxLength: parseOptionalInt(process.env.SMS_MAX_LENGTH),
      contextMinutes: parseOptionalInt(process.env.CHAT_CONTEXT_MINUTES),
    },
    messaging: {
      provider: process.env.MESSAGING_PROVIDER as MessagingProvider | undefined,
    },
    features: {
      agentLogging: parseOptionalBool(process.env.AGENT_LOGGING),
      enableConversationStorage: parseOptionalBool(process.env.ENABLE_CONVERSATION_STORAGE),
    },
    conversation: {
      timeoutMinutes: parseOptionalInt(process.env.CONVERSATION_TIMEOUT_MINUTES),
      maxLength: parseOptionalInt(process.env.MAX_CONVERSATION_LENGTH),
      inactiveThresholdDays: parseOptionalInt(process.env.INACTIVE_THRESHOLD_DAYS),
    },
    shortLinks: {
      defaultExpiryDays: parseOptionalInt(process.env.SHORT_LINK_DEFAULT_EXPIRY_DAYS),
      domain: process.env.SHORT_LINK_DOMAIN,
    },
    program: {
      defaultProgramId: process.env.DEFAULT_PROGRAM_ID,
    },
    stripe: {
      priceId: process.env.STRIPE_PRICE_ID,
    },
    admin: {
      phoneNumbers: process.env.ADMIN_PHONE_NUMBERS
        ? parsePhoneNumbers(process.env.ADMIN_PHONE_NUMBERS)
        : undefined,
      devBypassCode: process.env.DEV_BYPASS_CODE,
    },
    urls: {
      baseUrl: process.env.BASE_URL,
      publicBaseUrl: process.env.NEXT_PUBLIC_BASE_URL,
    },
  };

  // Validate with Zod - applies defaults and throws on failure
  const result = AppConfigSchema.safeParse(rawConfig);

  if (!result.success) {
    const errors = result.error.errors
      .map((e) => `  - ${e.path.join('.')}: ${e.message}`)
      .join('\n');

    throw new Error(
      `Configuration validation failed:\n${errors}\n\n` +
        `Environment: ${env}\n` +
        `Check your environment variables.`
    );
  }

  return result.data;
}

// Singleton config instance
let _config: AppConfig | null = null;

/**
 * Get the validated application config.
 * Caches the result for subsequent calls.
 */
export function getConfig(): AppConfig {
  if (!_config) {
    _config = loadConfig();
  }
  return _config;
}

/**
 * Reset config cache (useful for testing).
 */
export function resetConfig(): void {
  _config = null;
}
