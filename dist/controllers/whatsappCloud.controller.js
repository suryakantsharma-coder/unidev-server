"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendText = sendText;
exports.sendTemplate = sendTemplate;
exports.sendMedia = sendMedia;
const zod_1 = require("zod");
const waService = __importStar(require("../services/whatsappCloud.service"));
const convService = __importStar(require("../services/conversation.service"));
const sendTextSchema = zod_1.z.object({
    contactId: zod_1.z.string(),
    to: zod_1.z.string().min(7),
    text: zod_1.z.string().min(1).max(4096),
});
const sendTemplateSchema = zod_1.z.object({
    contactId: zod_1.z.string(),
    to: zod_1.z.string().min(7),
    templateName: zod_1.z.string(),
    languageCode: zod_1.z.string().optional(),
    components: zod_1.z.array(zod_1.z.unknown()).optional(),
});
const sendMediaSchema = zod_1.z.object({
    contactId: zod_1.z.string(),
    to: zod_1.z.string().min(7),
    type: zod_1.z.enum(['image', 'document', 'audio', 'video']),
    mediaUrl: zod_1.z.string().url(),
    caption: zod_1.z.string().optional(),
    filename: zod_1.z.string().optional(),
});
async function sendText(req, res, next) {
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
    }
    catch (err) {
        next(err);
    }
}
async function sendTemplate(req, res, next) {
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
    }
    catch (err) {
        next(err);
    }
}
async function sendMedia(req, res, next) {
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
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=whatsappCloud.controller.js.map