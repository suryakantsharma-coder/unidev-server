"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiContent = void 0;
const mongoose_1 = require("mongoose");
const aiContentSchema = new mongoose_1.Schema({
    leadId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Lead' },
    type: { type: String, enum: ['email', 'whatsapp', 'follow_up', 'proposal'], required: true },
    tone: { type: String, required: true },
    language: { type: String, required: true },
    subject: { type: String },
    body: { type: String, required: true },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });
aiContentSchema.index({ leadId: 1 });
aiContentSchema.index({ createdBy: 1 });
aiContentSchema.index({ createdAt: -1 });
exports.AiContent = (0, mongoose_1.model)('AiContent', aiContentSchema);
//# sourceMappingURL=AiContent.model.js.map