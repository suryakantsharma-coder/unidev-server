"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Conversation = void 0;
const mongoose_1 = require("mongoose");
const conversationSchema = new mongoose_1.Schema({
    contact: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Contact', required: true },
    leadId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Lead' },
    assignedAgent: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    status: {
        type: String,
        enum: ['open', 'pending', 'closed'],
        default: 'open',
    },
    lastMessage: { type: String },
    lastMessageAt: { type: Date },
    unreadCount: { type: Number, default: 0 },
}, { timestamps: true });
conversationSchema.index({ contact: 1 });
conversationSchema.index({ leadId: 1 });
conversationSchema.index({ status: 1 });
conversationSchema.index({ assignedAgent: 1 });
conversationSchema.index({ lastMessageAt: -1 });
exports.Conversation = (0, mongoose_1.model)('Conversation', conversationSchema);
//# sourceMappingURL=Conversation.model.js.map