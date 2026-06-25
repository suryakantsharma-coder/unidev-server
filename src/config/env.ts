import dotenv from 'dotenv';

dotenv.config();

const envSchema = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: process.env.PORT ?? '3000',
  MONGODB_URI: process.env.MONGODB_URI ?? '',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? '',
  REALTIME_MODEL: process.env.REALTIME_MODEL ?? 'gpt-realtime',
  REALTIME_DEFAULT_VOICE: process.env.REALTIME_DEFAULT_VOICE ?? 'shimmer',
  REALTIME_ENABLE_INPUT_TRANSCRIPTION:
    process.env.REALTIME_ENABLE_INPUT_TRANSCRIPTION ?? '1',
  REALTIME_INPUT_TRANSCRIPTION_MODEL:
    process.env.REALTIME_INPUT_TRANSCRIPTION_MODEL ?? 'gpt-4o-mini-transcribe',
  RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS ?? '60000',
  RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX ?? '30',
  /** When set (e.g. 1 or true), log all request/response data for testing */
  LOG_TEST_DATA: process.env.LOG_TEST_DATA ?? '',
  WHATSAPP_ENABLED: process.env.WHATSAPP_ENABLED ?? '',
  CHROME_PATH: process.env.CHROME_PATH ?? '',

  // Auth
  JWT_SECRET: process.env.JWT_SECRET ?? 'change_this_secret_in_production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '7d',

  // Mailtrap (dashboard email sending)
  MAILTRAP_HOST: process.env.MAILTRAP_HOST ?? 'sandbox.smtp.mailtrap.io',
  MAILTRAP_PORT: process.env.MAILTRAP_PORT ?? '2525',
  MAILTRAP_USER: process.env.MAILTRAP_USER ?? '',
  MAILTRAP_PASS: process.env.MAILTRAP_PASS ?? '',
  MAILTRAP_FROM: process.env.MAILTRAP_FROM ?? 'no-reply@unidevsolutions.in',

  // WhatsApp Business Cloud API
  WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID ?? '',
  WHATSAPP_BUSINESS_ACCOUNT_ID: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID ?? '',
  WHATSAPP_ACCESS_TOKEN: process.env.WHATSAPP_ACCESS_TOKEN ?? '',
  WHATSAPP_VERIFY_TOKEN: process.env.WHATSAPP_VERIFY_TOKEN ?? '',
  WHATSAPP_APP_SECRET: process.env.WHATSAPP_APP_SECRET ?? '',

  // Email sequence test mode — when enabled, delays are in minutes instead of days
  SEQUENCE_TEST_MODE: process.env.SEQUENCE_TEST_MODE ?? '',
} as const;

export const env = {
  ...envSchema,
  PORT: parseInt(envSchema.PORT, 10),
  RATE_LIMIT_WINDOW_MS: parseInt(envSchema.RATE_LIMIT_WINDOW_MS, 10),
  RATE_LIMIT_MAX: parseInt(envSchema.RATE_LIMIT_MAX, 10),
  MAILTRAP_PORT: parseInt(envSchema.MAILTRAP_PORT, 10),
  isProduction: envSchema.NODE_ENV === 'production',
  logTestData: /^(1|true|yes)$/i.test(envSchema.LOG_TEST_DATA),
  realtimeEnableInputTranscription: /^(1|true|yes)$/i.test(
    envSchema.REALTIME_ENABLE_INPUT_TRANSCRIPTION,
  ),
  whatsappEnabled: /^(1|true|yes)$/i.test(envSchema.WHATSAPP_ENABLED),
  sequenceTestMode: /^(1|true|yes)$/i.test(envSchema.SEQUENCE_TEST_MODE),
  chromePath: envSchema.CHROME_PATH || undefined,
};
