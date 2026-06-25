"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTextMessage = sendTextMessage;
exports.sendTemplateMessage = sendTemplateMessage;
exports.sendMediaMessage = sendMediaMessage;
exports.markMessageRead = markMessageRead;
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../config/env");
const WA_API_VERSION = 'v19.0';
function buildClient() {
    return axios_1.default.create({
        baseURL: `https://graph.facebook.com/${WA_API_VERSION}/${env_1.env.WHATSAPP_PHONE_NUMBER_ID}`,
        headers: {
            Authorization: `Bearer ${env_1.env.WHATSAPP_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
        },
    });
}
async function sendTextMessage(input) {
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
async function sendTemplateMessage(input) {
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
async function sendMediaMessage(input) {
    const client = buildClient();
    const mediaPayload = { link: input.mediaUrl };
    if (input.caption)
        mediaPayload.caption = input.caption;
    if (input.filename)
        mediaPayload.filename = input.filename;
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
async function markMessageRead(waMessageId) {
    const client = buildClient();
    await client.post('/messages', {
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: waMessageId,
    });
}
//# sourceMappingURL=whatsappCloud.service.js.map