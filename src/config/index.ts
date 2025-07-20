// Centralized configuration management
export const config = {
  // Database configuration
  database: {
    postgres: {
      connectionString: process.env.DATABASE_URL!,
      maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '10'),
    },
    pinecone: {
      apiKey: process.env.PINECONE_API_KEY!,
      environment: process.env.PINECONE_ENVIRONMENT!,
      indexName: process.env.PINECONE_INDEX_NAME || 'gymtext',
    }
  },
  
  // Third-party services
  services: {
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID!,
      authToken: process.env.TWILIO_AUTH_TOKEN!,
      phoneNumber: process.env.TWILIO_PHONE_NUMBER!,
    },
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY!,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
      priceId: process.env.STRIPE_PRICE_ID!,
    },
    google: {
      geminiApiKey: process.env.GOOGLE_GEMINI_API_KEY!,
    }
  },
  
  // Application settings
  app: {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000'),
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  },
  
  // Feature flags
  features: {
    enableSMS: process.env.ENABLE_SMS === 'true',
    enablePayments: process.env.ENABLE_PAYMENTS === 'true',
    enableAI: process.env.ENABLE_AI === 'true',
  }
};

// Type-safe environment variable validation
export function validateConfig() {
  const required = [
    'DATABASE_URL',
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'TWILIO_PHONE_NUMBER',
    'STRIPE_SECRET_KEY',
    'GOOGLE_GEMINI_API_KEY',
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}