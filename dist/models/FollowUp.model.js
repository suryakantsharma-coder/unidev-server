"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FollowUp = void 0;
const mongoose_1 = require("mongoose");
const followUpSchema = new mongoose_1.Schema({
    contact: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Contact' },
    leadId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Lead' },
    assignedUser: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    scheduledAt: { type: Date, required: true },
    message: { type: String, required: true },
    status: {
        type: String,
        enum: ['pending', 'completed', 'cancelled', 'overdue'],
        default: 'pending',
    },
    notes: { type: String },
    completedAt: { type: Date },
}, { timestamps: true });
followUpSchema.index({ assignedUser: 1, scheduledAt: 1 });
followUpSchema.index({ contact: 1 });
followUpSchema.index({ leadId: 1 });
followUpSchema.index({ status: 1 });
exports.FollowUp = (0, mongoose_1.model)('FollowUp', followUpSchema);
//# sourceMappingURL=FollowUp.model.js.map