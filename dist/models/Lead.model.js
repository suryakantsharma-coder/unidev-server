"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lead = void 0;
const mongoose_1 = require("mongoose");
const leadSchema = new mongoose_1.Schema({
    title: { type: String, required: true, trim: true },
    categories: [{ type: String, trim: true }],
    categoryName: { type: String, trim: true },
    category: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Category' },
    address: { type: String, trim: true },
    neighborhood: { type: String, trim: true },
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    postalCode: { type: String, trim: true },
    countryCode: { type: String, trim: true, uppercase: true },
    website: { type: String, trim: true },
    phone: { type: String, trim: true },
    phoneUnformatted: { type: String, trim: true },
    location: {
        lat: { type: Number },
        lng: { type: Number },
    },
    plusCode: { type: String, trim: true },
    status: {
        type: String,
        enum: ['New', 'Contacted', 'Proposal', 'Negotiation', 'Qualified', 'Won', 'Lost'],
        default: 'New',
    },
    priority: {
        type: String,
        enum: ['high', 'medium', 'low'],
        default: 'medium',
    },
    notes: { type: String },
    metadata: { type: mongoose_1.Schema.Types.Mixed, default: {} },
}, { timestamps: true });
leadSchema.index({ status: 1 });
leadSchema.index({ priority: 1 });
leadSchema.index({ category: 1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ city: 1 });
leadSchema.index({ state: 1 });
leadSchema.index({ countryCode: 1 });
leadSchema.index({ phoneUnformatted: 1 });
leadSchema.index({ title: 'text', categoryName: 'text', city: 'text', phone: 'text' });
exports.Lead = (0, mongoose_1.model)('Lead', leadSchema);
//# sourceMappingURL=Lead.model.js.map