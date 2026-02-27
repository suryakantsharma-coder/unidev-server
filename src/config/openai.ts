import OpenAI from 'openai';
import { env } from './env';

if (!env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not defined in environment');
}

export const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export const OPENAI_MODEL = 'gpt-4o-mini';
export const OPENAI_TEMPERATURE = 0.4;
export const OPENAI_MAX_TOKENS = 1024;
