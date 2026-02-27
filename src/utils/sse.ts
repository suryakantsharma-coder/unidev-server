import { Response } from 'express';

const SSE_HEADERS = {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
  Connection: 'keep-alive',
  'X-Accel-Buffering': 'no',
} as const;

export function setupSse(res: Response): void {
  res.writeHead(200, SSE_HEADERS);
  res.flushHeaders();
}

/** Send an initial event so the client receives a response immediately (avoids “no response” until first token). */
export function sendSseInitial(res: Response): void {
  res.write('data: {"started":true}\n\n');
  flushRes(res);
}

function flushRes(res: Response): void {
  const f = (res as Response & { flush?: () => void }).flush;
  if (typeof f === 'function') f.call(res);
}

export function sendSseChunk(res: Response, data: unknown): void {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
  flushRes(res);
}

export const SSE_DONE = { done: true } as const;

export function sendSseDone(res: Response): void {
  res.write('data: [DONE]\n\n');
}

export function isSseConnectionClosed(res: Response): boolean {
  return res.writableEnded;
}
