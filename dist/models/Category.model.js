"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Category = void 0;
const mongoose_1 = require("mongoose");
const categorySchema = new mongoose_1.Schema({
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
    color: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
categorySchema.index({ name: 1 });
categorySchema.index({ isActive: 1 });
exports.Category = (0, mongoose_1.model)('Category', categorySchema);
//# sourceMappingURL=Category.model.js.map