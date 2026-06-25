"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findOrCreateConversation = findOrCreateConversation;
exports.listConversations = listConversations;
exports.getConversation = getConversation;
exports.updateConversationStatus = updateConversationStatus;
exports.assignConversation = assignConversation;
exports.listMessages = listMessages;
exports.saveMessage = saveMessage;
exports.updateMessageStatus = updateMessageStatus;
const Conversation_model_1 = require("../models/Conversation.model");
const Message_model_1 = require("../models/Message.model");
const mongoose_1 = require("mongoose");
async function findOrCreateConversation(contactId) {
    let conversation = await Conversation_model_1.Conversation.findOne({
        contact: new mongoose_1.Types.ObjectId(contactId),
        status: { $ne: 'closed' },
    });
    if (!conversation) {
        conversation = await Conversation_model_1.Conversation.create({ contact: contactId, status: 'open' });
    }
    return conversation;
}
async function listConversations(filters) {
    const query = {};
    if (filters.status)
        query.status = filters.status;
    if (filters.assignedAgent)
        query.assignedAgent = new mongoose_1.Types.ObjectId(filters.assignedAgent);
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(100, filters.limit ?? 20);
    const skip = (page - 1) * limit;
    const [conversations, total] = await Promise.all([
        Conversation_model_1.Conversation.find(query)
            .populate('contact', 'name phone email')
            .populate('assignedAgent', 'name email')
            .sort({ lastMessageAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Conversation_model_1.Conversation.countDocuments(query),
    ]);
    return { conversations, total, page, limit, pages: Math.ceil(total / limit) };
}
async function getConversation(id) {
    const conv = await Conversation_model_1.Conversation.findById(id)
        .populate('contact', 'name phone email tags')
        .populate('assignedAgent', 'name email');
    if (!conv)
        throw Object.assign(new Error('Conversation not found'), { statusCode: 404 });
    return conv;
}
async function updateConversationStatus(id, status) {
    const conv = await Conversation_model_1.Conversation.findByIdAndUpdate(id, { status }, { new: true });
    if (!conv)
        throw Object.assign(new Error('Conversation not found'), { statusCode: 404 });
    return conv;
}
async function assignConversation(id, agentId) {
    const conv = await Conversation_model_1.Conversation.findByIdAndUpdate(id, { assignedAgent: new mongoose_1.Types.ObjectId(agentId) }, { new: true });
    if (!conv)
        throw Object.assign(new Error('Conversation not found'), { statusCode: 404 });
    return conv;
}
async function listMessages(conversationId, page = 1, limit = 50) {
    const skip = (Math.max(1, page) - 1) * Math.min(100, limit);
    const [messages, total] = await Promise.all([
        Message_model_1.Message.find({ conversation: new mongoose_1.Types.ObjectId(conversationId) })
            .populate('sentBy', 'name')
            .sort({ createdAt: 1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Message_model_1.Message.countDocuments({ conversation: new mongoose_1.Types.ObjectId(conversationId) }),
    ]);
    return { messages, total, page, limit };
}
async function saveMessage(data) {
    const message = await Message_model_1.Message.create({
        conversation: data.conversationId,
        contact: data.contactId,
        direction: data.direction,
        type: data.type,
        content: data.content,
        waMessageId: data.waMessageId,
        status: data.direction === 'inbound' ? 'received' : 'sent',
        sentBy: data.sentBy,
        templateName: data.templateName,
        mediaUrl: data.mediaUrl,
    });
    // Keep conversation summary up to date
    await Conversation_model_1.Conversation.findByIdAndUpdate(data.conversationId, {
        lastMessage: data.content.slice(0, 200),
        lastMessageAt: message.createdAt,
        ...(data.direction === 'inbound' ? { $inc: { unreadCount: 1 } } : {}),
    });
    return message;
}
/** Update message delivery/read status from webhook events */
async function updateMessageStatus(waMessageId, status, failureReason) {
    return Message_model_1.Message.findOneAndUpdate({ waMessageId }, { status, failureReason, statusUpdatedAt: new Date() }, { new: true });
}
//# sourceMappingURL=conversation.service.js.map