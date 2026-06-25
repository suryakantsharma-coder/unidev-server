"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportJob = void 0;
const mongoose_1 = require("mongoose");
const importJobSchema = new mongoose_1.Schema({
    filename: { type: String, required: true },
    status: { type: String, enum: ['queued', 'processing', 'done', 'failed'], default: 'queued' },
    total: { type: Number, default: 0 },
    imported: { type: Number, default: 0 },
    duplicates: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    importErrors: [
        {
            row: Number,
            data: { type: mongoose_1.Schema.Types.Mixed },
            reason: String,
        },
    ],
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    completedAt: { type: Date },
}, { timestamps: true });
exports.ImportJob = (0, mongoose_1.model)('ImportJob', importJobSchema);
//# sourceMappingURL=ImportJob.model.js.map