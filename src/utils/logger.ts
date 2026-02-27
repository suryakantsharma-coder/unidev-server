import { env } from '../config/env';

const prefix = '[chat]';

function enabled(): boolean {
  return env.logTestData;
}

/** Log request/response data for testing. Only logs when LOG_TEST_DATA=1 (or true/yes). */
export function logTest(label: string, data: unknown): void {
  if (!enabled()) return;
  const payload = typeof data === 'object' && data !== null ? JSON.stringify(data, null, 2) : String(data);
  process.stdout.write(`${prefix} ${label} ${payload}\n`);
}

/** Log a single line for testing. */
export function logTestLine(label: string, message: string): void {
  if (!enabled()) return;
  process.stdout.write(`${prefix} ${label} ${message}\n`);
}

/** Always log messages sent to the chatbot (input). */
export function logChatInput(messages: Array<{ role: string; content: string }>): void {
  const payload = JSON.stringify(messages, null, 2);
  process.stdout.write(`${prefix} CHAT INPUT (sent to chatbot):\n${payload}\n`);
}

/** Always log response received from the chatbot (output). */
export function logChatOutput(content: string): void {
  process.stdout.write(`${prefix} CHAT OUTPUT (from chatbot):\n${content}\n`);
}
