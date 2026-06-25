"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SentEmail = void 0;
const mongoose_1 = require("mongoose");
const sentEmailSchema = new mongoose_1.Schema({
    from: { type: String, required: true },
    to: [{ type: String, required: true }],
    cc: [{ type: String }],
    bcc: [{ type: String }],
    subject: { type: String, required: true },
    body: { type: String, required: true },
    status: { type: String, enum: ['sent', 'failed'], required: true },
    errorMessage: { type: String },
    sentBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    leadId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Lead' },
    sentAt: { type: Date, default: Date.now },
});
sentEmailSchema.index({ sentBy: 1 });
sentEmailSchema.index({ sentAt: -1 });
sentEmailSchema.index({ leadId: 1 });
// Auto-delete after 4 months (≈120 days)
sentEmailSchema.index({ sentAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 120 });
exports.SentEmail = (0, mongoose_1.model)('SentEmail', sentEmailSchema);
//# sourceMappingURL=SentEmail.model.js.map