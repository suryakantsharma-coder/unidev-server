import axios, { AxiosInstance } from 'axios';
import { env } from '../config/env';

const WA_API_VERSION = 'v19.0';

function buildClient(): AxiosInstance {
  return axios.create({
    baseURL: `https://graph.facebook.com/${WA_API_VERSION}/${env.WHATSAPP_PHONE_NUMBER_ID}`,
    headers: {
      Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });
}

export interface SendTextInput {
  to: string;
  text: string;
}

export interface SendTemplateInput {
  to: string;
  templateName: string;
  languageCode?: string;
  components?: unknown[];
}

export interface SendMediaInput {
  to: string;
  type: 'image' | 'document' | 'audio' | 'video';
  mediaUrl: string;
  caption?: string;
  filename?: string;
}

export interface WaSendResult {
  waMessageId: string;
  status: string;
}

export async function sendTextMessage(input: SendTextInput): Promise<WaSendResult> {
  const client = buildClient();
  const res = await client.post('/messages', {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: input.to,
    type: 'text',
    text: { preview_url: false, body: input.text },
  });
  return {
    waMessageId: res.data.messages?.[0]?.id ?? '',
    status: 'sent',
  };
}

export async function sendTemplateMessage(input: SendTemplateInput): Promise<WaSendResult> {
  const client = buildClient();
  const res = await client.post('/messages', {
    messaging_product: 'whatsapp',
    to: input.to,
    type: 'template',
    template: {
      name: input.templateName,
      language: { code: input.languageCode ?? 'en_US' },
      components: input.components ?? [],
    },
  });
  return {
    waMessageId: res.data.messages?.[0]?.id ?? '',
    status: 'sent',
  };
}

export async function sendMediaMessage(input: SendMediaInput): Promise<WaSendResult> {
  const client = buildClient();
  const mediaPayload: Record<string, unknown> = { link: input.mediaUrl };
  if (input.caption) mediaPayload.caption = input.caption;
  if (input.filename) mediaPayload.filename = input.filename;

  const res = await client.post('/messages', {
    messaging_product: 'whatsapp',
    to: input.to,
    type: input.type,
    [input.type]: mediaPayload,
  });
  return {
    waMessageId: res.data.messages?.[0]?.id ?? '',
    status: 'sent',
  };
}

export async function markMessageRead(waMessageId: string): Promise<void> {
  const client = buildClient();
  await client.post('/messages', {
    messaging_product: 'whatsapp',
    status: 'read',
    message_id: waMessageId,
  });
}
