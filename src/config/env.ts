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
} as const;

export const env = {
  ...envSchema,
  PORT: parseInt(envSchema.PORT, 10),
  RATE_LIMIT_WINDOW_MS: parseInt(envSchema.RATE_LIMIT_WINDOW_MS, 10),
  RATE_LIMIT_MAX: parseInt(envSchema.RATE_LIMIT_MAX, 10),
  isProduction: envSchema.NODE_ENV === 'production',
  logTestData: /^(1|true|yes)$/i.test(envSchema.LOG_TEST_DATA),
  realtimeEnableInputTranscription: /^(1|true|yes)$/i.test(
    envSchema.REALTIME_ENABLE_INPUT_TRANSCRIPTION,
  ),
  whatsappEnabled: /^(1|true|yes)$/i.test(envSchema.WHATSAPP_ENABLED),
  chromePath: envSchema.CHROME_PATH || undefined,
};
