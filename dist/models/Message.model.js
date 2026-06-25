"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
const mongoose_1 = require("mongoose");
const messageSchema = new mongoose_1.Schema({
    conversation: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Conversation', required: true },
    contact: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Contact', required: true },
    direction: { type: String, enum: ['inbound', 'outbound'], required: true },
    type: {
        type: String,
        enum: ['text', 'image', 'document', 'template', 'audio', 'video'],
        default: 'text',
    },
    content: { type: String, required: true },
    waMessageId: { type: String, index: true },
    status: {
        type: String,
        enum: ['sent', 'delivered', 'read', 'failed', 'received'],
        default: 'sent',
    },
    templateName: { type: String },
    mediaUrl: { type: String },
    sentBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    failureReason: { type: String },
    statusUpdatedAt: { type: Date },
}, { timestamps: true });
messageSchema.index({ conversation: 1, createdAt: 1 });
messageSchema.index({ waMessageId: 1 });
exports.Message = (0, mongoose_1.model)('Message', messageSchema);
//# sourceMappingURL=Message.model.js.map