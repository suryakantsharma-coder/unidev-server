"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookLog = void 0;
const mongoose_1 = require("mongoose");
const webhookLogSchema = new mongoose_1.Schema({
    source: { type: String, required: true, index: true },
    event: { type: String },
    payload: { type: mongoose_1.Schema.Types.Mixed, required: true },
    receivedAt: { type: Date, default: Date.now, index: true },
    processed: { type: Boolean, default: false },
    processingError: { type: String },
}, {
    // No updatedAt needed — logs are immutable
    timestamps: { createdAt: false, updatedAt: false },
});
// Auto-expire logs after 90 days
webhookLogSchema.index({ receivedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });
exports.WebhookLog = (0, mongoose_1.model)('WebhookLog', webhookLogSchema);
//# sourceMappingURL=WebhookLog.model.js.map