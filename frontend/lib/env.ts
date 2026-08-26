function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
      `Check .env.local or your environment configuration.`
    );
  }
  return value;
}

export const env = {
  // Server-only secrets
  database: {
    url: requireEnv('DATABASE_URL'),
  },
  api: {
    secretKey: requireEnv('API_SECRET_KEY'),
  },
  jwt: {
    secret: requireEnv('JWT_SECRET'),
  },
  stripe: {
    secretKey: requireEnv('STRIPE_SECRET_KEY'),
  },

  // Public variables
  public: {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
    appName: process.env.NEXT_PUBLIC_APP_NAME || 'My App',
    stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'not-set',
    analyticsId: process.env.NEXT_PUBLIC_ANALYTICS_ID || 'not-set',
  },
};