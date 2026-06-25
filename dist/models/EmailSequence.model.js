"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailSequence = void 0;
const mongoose_1 = require("mongoose");
const stepSchema = new mongoose_1.Schema({
    stepNumber: { type: Number, required: true },
    label: { type: String, required: true },
    scheduledAt: { type: Date, required: true },
    sentAt: { type: Date },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    status: { type: String, enum: ['pending', 'sending', 'sent', 'failed', 'skipped'], default: 'pending' },
    errorMessage: { type: String },
}, { _id: false });
const emailSequenceSchema = new mongoose_1.Schema({
    leadId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Lead' },
    to: [{ type: String, required: true }],
    cc: [{ type: String }],
    from: { type: String },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['active', 'paused', 'completed', 'cancelled'], default: 'active' },
    leadContext: { type: mongoose_1.Schema.Types.Mixed, default: {} },
    steps: [stepSchema],
}, { timestamps: true });
emailSequenceSchema.index({ status: 1 });
emailSequenceSchema.index({ leadId: 1 });
emailSequenceSchema.index({ createdBy: 1 });
// For the cron job — quickly find active sequences with pending steps due now
emailSequenceSchema.index({ status: 1, 'steps.scheduledAt': 1, 'steps.status': 1 });
exports.EmailSequence = (0, mongoose_1.model)('EmailSequence', emailSequenceSchema);
//# sourceMappingURL=EmailSequence.model.js.map