"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyWebhook = verifyWebhook;
exports.receiveWebhook = receiveWebhook;
const crypto_1 = __importDefault(require("crypto"));
const env_1 = require("../config/env");
const WebhookLog_model_1 = require("../models/WebhookLog.model");
const contact_service_1 = require("../services/contact.service");
const conversation_service_1 = require("../services/conversation.service");
/**
 * GET /api/webhooks/whatsapp
 * Meta sends this to verify the webhook URL during setup.
 */
function verifyWebhook(req, res) {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    if (mode === 'subscribe' && token === env_1.env.WHATSAPP_VERIFY_TOKEN) {
        res.status(200).send(challenge);
        return;
    }
    res.status(403).json({ success: false, message: 'Verification failed' });
}
/**
 * POST /api/webhooks/whatsapp
 * Receives incoming messages, status updates, and other events from Meta.
 */
async function receiveWebhook(req, res, next) {
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
function verifySignature(req) {
    const secret = env_1.env.WHATSAPP_APP_SECRET;
    // Skip verification if secret is not configured (dev environment)
    if (!secret)
        return true;
    const signature = req.headers['x-hub-signature-256'];
    if (!signature)
        return false;
    const expected = `sha256=${crypto_1.default
        .createHmac('sha256', secret)
        .update(JSON.stringify(req.body))
        .digest('hex')}`;
    return crypto_1.default.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
async function processWebhookPayload(body) {
    const log = await WebhookLog_model_1.WebhookLog.create({
        source: 'whatsapp_cloud',
        payload: body,
        receivedAt: new Date(),
    });
    try {
        const entry = body.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;
        if (!value)
            return;
        // Handle incoming messages
        const messages = value.messages;
        if (messages?.length) {
            for (const rawMsg of messages) {
                await handleIncomingMessage(rawMsg);
            }
        }
        // Handle status updates (delivered, read, failed)
        const statuses = value.statuses;
        if (statuses?.length) {
            for (const rawStatus of statuses) {
                await handleStatusUpdate(rawStatus);
            }
        }
        await WebhookLog_model_1.WebhookLog.findByIdAndUpdate(log._id, { processed: true });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        await WebhookLog_model_1.WebhookLog.findByIdAndUpdate(log._id, { processingError: message });
    }
}
async function handleIncomingMessage(msg) {
    const from = msg.from;
    const waMessageId = msg.id;
    const type = msg.type ?? 'text';
    let content = '';
    if (type === 'text') {
        content = msg.text?.body ?? '';
    }
    else if (type === 'image' || type === 'document' || type === 'audio' || type === 'video') {
        const media = msg[type];
        content = media?.caption ?? `[${type}]`;
    }
    else {
        content = `[${type}]`;
    }
    const contact = await (0, contact_service_1.findOrCreateByPhone)(from);
    const conversation = await (0, conversation_service_1.findOrCreateConversation)(String(contact._id));
    await (0, conversation_service_1.saveMessage)({
        conversationId: String(conversation._id),
        contactId: String(contact._id),
        direction: 'inbound',
        type: type,
        content,
        waMessageId,
    });
}
async function handleStatusUpdate(status) {
    const waMessageId = status.id;
    const statusValue = status.status;
    let failureReason;
    if (statusValue === 'failed') {
        const errors = status.errors;
        failureReason = errors?.[0]?.message;
    }
    await (0, conversation_service_1.updateMessageStatus)(waMessageId, statusValue, failureReason);
}
//# sourceMappingURL=webhook.controller.js.map