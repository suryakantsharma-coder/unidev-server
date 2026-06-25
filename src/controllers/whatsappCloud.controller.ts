import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as waService from '../services/whatsappCloud.service';
import * as convService from '../services/conversation.service';
import * as contactService from '../services/contact.service';

const sendTextSchema = z.object({
  contactId: z.string(),
  to: z.string().min(7),
  text: z.string().min(1).max(4096),
});

const sendTemplateSchema = z.object({
  contactId: z.string(),
  to: z.string().min(7),
  templateName: z.string(),
  languageCode: z.string().optional(),
  components: z.array(z.unknown()).optional(),
});

const sendMediaSchema = z.object({
  contactId: z.string(),
  to: z.string().min(7),
  type: z.enum(['image', 'document', 'audio', 'video']),
  mediaUrl: z.string().url(),
  caption: z.string().optional(),
  filename: z.string().optional(),
});

export async function sendText(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = sendTextSchema.parse(req.body);
    const result = await waService.sendTextMessage({ to: input.to, text: input.text });

    const conversation = await convService.findOrCreateConversation(input.contactId);
    await convService.saveMessage({
      conversationId: String(conversation._id),
      contactId: input.contactId,
      direction: 'outbound',
      type: 'text',
      content: input.text,
      waMessageId: result.waMessageId,
      sentBy: String(req.user?._id),
    });

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function sendTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = sendTemplateSchema.parse(req.body);
    const result = await waService.sendTemplateMessage({
      to: input.to,
      templateName: input.templateName,
      languageCode: input.languageCode,
      components: input.components,
    });

    const conversation = await convService.findOrCreateConversation(input.contactId);
    await convService.saveMessage({
      conversationId: String(conversation._id),
      contactId: input.contactId,
      direction: 'outbound',
      type: 'template',
      content: `[Template: ${input.templateName}]`,
      waMessageId: result.waMessageId,
      sentBy: String(req.user?._id),
      templateName: input.templateName,
    });

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function sendMedia(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = sendMediaSchema.parse(req.body);
    const result = await waService.sendMediaMessage({
      to: input.to,
      type: input.type,
      mediaUrl: input.mediaUrl,
      caption: input.caption,
      filename: input.filename,
    });

    const conversation = await convService.findOrCreateConversation(input.contactId);
    await convService.saveMessage({
      conversationId: String(conversation._id),
      contactId: input.contactId,
      direction: 'outbound',
      type: input.type,
      content: input.caption ?? `[${input.type}]`,
      waMessageId: result.waMessageId,
      sentBy: String(req.user?._id),
      mediaUrl: input.mediaUrl,
    });

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
