"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMessage = createMessage;
exports.createManyMessages = createManyMessages;
const ChatMessage_model_1 = require("../models/ChatMessage.model");
async function createMessage(role, content) {
    const doc = await ChatMessage_model_1.ChatMessage.create({ role, content });
    return {
        role: doc.role,
        content: doc.content,
        createdAt: doc.createdAt,
    };
}
async function createManyMessages(messages) {
    if (messages.length === 0)
        return [];
    const docs = await ChatMessage_model_1.ChatMessage.insertMany(messages);
    return docs.map((d) => ({
        role: d.role,
        content: d.content,
        createdAt: d.createdAt,
    }));
}
//# sourceMappingURL=chat.repository.js.map