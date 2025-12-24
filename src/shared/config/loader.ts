import { AppConfigSchema, type AppConfig, type MessagingProvider } from './schema';
import { baseConfig } from './environments/base';
import { developmentConfig } from './environments/development';
import { stagingConfig } from './environments/staging';
import { productionConfig } from './environments/production';

export type Environment = 'development' | 'staging' | 'production';

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

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
 * Get environment-specific base config.
 */
function getEnvironmentConfig(env: Environment): DeepPartial<AppConfig> {
  switch (env) {
    case 'production':
      return productionConfig;
    case 'staging':
      return stagingConfig;
    case 'development':
    default:
      return developmentConfig;
  }
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
 * Treats 'false' as false, anything else truthy as true.
 */
function parseOptionalBool(
  value: string | undefined,
  invertCheck = false
): boolean | undefined {
  if (value === undefined) return undefined;
  if (invertCheck) {
    return value !== 'false';
  }
  return value === 'true';
}

/**
 * Build config from environment variables (for runtime overrides).
 * These env vars allow override of config values without changing code.
 */
function buildEnvOverrides(): DeepPartial<AppConfig> {
  return {
    context: {
      messageHistoryLimit: parseOptionalInt(
        process.env.CONTEXT_MESSAGE_HISTORY_LIMIT
      ),
      includeSystemMessages: parseOptionalBool(
        process.env.CONTEXT_INCLUDE_SYSTEM_MESSAGES,
        true
      ),
      maxContextTokens: parseOptionalInt(process.env.CONTEXT_MAX_TOKENS),
      reserveTokensForResponse: parseOptionalInt(
        process.env.CONTEXT_RESERVE_TOKENS
      ),
      conversationGapMinutes: parseOptionalInt(
        process.env.CONTEXT_CONVERSATION_GAP_MINUTES
      ),
      enableCaching: parseOptionalBool(
        process.env.CONTEXT_ENABLE_CACHING,
        true
      ),
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
      enableConversationStorage: parseOptionalBool(
        process.env.ENABLE_CONVERSATION_STORAGE,
        true
      ),
    },
    conversation: {
      timeoutMinutes: parseOptionalInt(
        process.env.CONVERSATION_TIMEOUT_MINUTES
      ),
      maxLength: parseOptionalInt(process.env.MAX_CONVERSATION_LENGTH),
      inactiveThresholdDays: parseOptionalInt(
        process.env.INACTIVE_THRESHOLD_DAYS
      ),
    },
    shortLinks: {
      defaultExpiryDays: parseOptionalInt(
        process.env.SHORT_LINK_DEFAULT_EXPIRY_DAYS
      ),
      domain: process.env.SHORT_LINK_DOMAIN,
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
}

/**
 * Deep merge configs, with later sources overriding earlier ones.
 * Filters out undefined values before merging.
 */
function deepMerge<T extends Record<string, unknown>>(
  target: T,
  source: DeepPartial<T>
): T {
  const result = { ...target };

  for (const key of Object.keys(source) as Array<keyof T>) {
    const sourceValue = source[key as keyof typeof source];
    if (sourceValue === undefined) continue;

    if (
      typeof sourceValue === 'object' &&
      sourceValue !== null &&
      !Array.isArray(sourceValue) &&
      typeof result[key] === 'object' &&
      result[key] !== null
    ) {
      result[key] = deepMerge(
        result[key] as Record<string, unknown>,
        sourceValue as Record<string, unknown>
      ) as T[keyof T];
    } else {
      result[key] = sourceValue as T[keyof T];
    }
  }

  return result;
}

/**
 * Load and validate configuration.
 * Throws on validation failure (fail-fast).
 */
export function loadConfig(): AppConfig {
  const env = getEnvironment();
  const envConfig = getEnvironmentConfig(env);
  const envOverrides = buildEnvOverrides();

  // Merge: base -> environment -> env vars
  let merged = deepMerge(baseConfig as AppConfig, envConfig);
  merged = deepMerge(merged, envOverrides);

  // Add environment to merged config
  merged.environment = env;

  // Validate with Zod - throws on failure
  const result = AppConfigSchema.safeParse(merged);

  if (!result.success) {
    const errors = result.error.errors
      .map((e) => `  - ${e.path.join('.')}: ${e.message}`)
      .join('\n');

    throw new Error(
      `Configuration validation failed:\n${errors}\n\n` +
        `Environment: ${env}\n` +
        `Check your environment variables and config files.`
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
