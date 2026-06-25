"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Contact = void 0;
const mongoose_1 = require("mongoose");
const contactSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    tags: [{ type: String, trim: true }],
    notes: { type: String },
    assignedAgent: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
contactSchema.index({ phone: 1 });
contactSchema.index({ assignedAgent: 1 });
exports.Contact = (0, mongoose_1.model)('Contact', contactSchema);
//# sourceMappingURL=Contact.model.js.map