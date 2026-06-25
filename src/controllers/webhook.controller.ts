import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { env } from '../config/env';
import { WebhookLog } from '../models/WebhookLog.model';
import { findOrCreateByPhone } from '../services/contact.service';
import { findOrCreateConversation, saveMessage, updateMessageStatus } from '../services/conversation.service';

/**
 * GET /api/webhooks/whatsapp
 * Meta sends this to verify the webhook URL during setup.
 */
export function verifyWebhook(req: Request, res: Response): void {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === env.WHATSAPP_VERIFY_TOKEN) {
    res.status(200).send(challenge);
    return;
  }
  res.status(403).json({ success: false, message: 'Verification failed' });
}

/**
 * POST /api/webhooks/whatsapp
 * Receives incoming messages, status updates, and other events from Meta.
 */
export async function receiveWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
  // Verify request signature to ensure it comes from Meta
  if (!verifySignature(req)) {
    res.status(401).json({ success: false, message: 'Invalid signature' });
    return;
  }

  // Respond immediately — Meta retries if it doesn't get 200 within 20s
  res.status(200).json({ success: true });

  // Process asynchronously to avoid blocking the response
  processWebhookPayload(req.body).catch((err) => {
    console.error('[Webhook] Processing error:', err);
  });
}

function verifySignature(req: Request): boolean {
  const secret = env.WHATSAPP_APP_SECRET;
  // Skip verification if secret is not configured (dev environment)
  if (!secret) return true;

  const signature = req.headers['x-hub-signature-256'] as string;
  if (!signature) return false;

  const expected = `sha256=${crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(req.body))
    .digest('hex')}`;

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

async function processWebhookPayload(body: Record<string, unknown>): Promise<void> {
  const log = await WebhookLog.create({
    source: 'whatsapp_cloud',
    payload: body,
    receivedAt: new Date(),
  });

  try {
    const entry = (body.entry as unknown[])?.[0] as Record<string, unknown> | undefined;
    const changes = (entry?.changes as unknown[])?.[0] as Record<string, unknown> | undefined;
    const value = changes?.value as Record<string, unknown> | undefined;

    if (!value) return;

    // Handle incoming messages
    const messages = value.messages as unknown[] | undefined;
    if (messages?.length) {
      for (const rawMsg of messages) {
        await handleIncomingMessage(rawMsg as Record<string, unknown>);
      }
    }

    // Handle status updates (delivered, read, failed)
    const statuses = value.statuses as unknown[] | undefined;
    if (statuses?.length) {
      for (const rawStatus of statuses) {
        await handleStatusUpdate(rawStatus as Record<string, unknown>);
      }
    }

    await WebhookLog.findByIdAndUpdate(log._id, { processed: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await WebhookLog.findByIdAndUpdate(log._id, { processingError: message });
  }
}

async function handleIncomingMessage(msg: Record<string, unknown>): Promise<void> {
  const from = msg.from as string;
  const waMessageId = msg.id as string;
  const type = (msg.type as string) ?? 'text';

  let content = '';
  if (type === 'text') {
    content = (msg.text as Record<string, string>)?.body ?? '';
  } else if (type === 'image' || type === 'document' || type === 'audio' || type === 'video') {
    const media = msg[type] as Record<string, string> | undefined;
    content = media?.caption ?? `[${type}]`;
  } else {
    content = `[${type}]`;
  }

  const contact = await findOrCreateByPhone(from);
  const conversation = await findOrCreateConversation(String(contact._id));
  await saveMessage({
    conversationId: String(conversation._id),
    contactId: String(contact._id),
    direction: 'inbound',
    type: type as 'text' | 'image' | 'document' | 'audio' | 'video',
    content,
    waMessageId,
  });
}

async function handleStatusUpdate(status: Record<string, unknown>): Promise<void> {
  const waMessageId = status.id as string;
  const statusValue = status.status as 'delivered' | 'read' | 'failed';

  let failureReason: string | undefined;
  if (statusValue === 'failed') {
    const errors = status.errors as Array<{ message?: string }> | undefined;
    failureReason = errors?.[0]?.message;
  }

  await updateMessageStatus(waMessageId, statusValue, failureReason);
}
