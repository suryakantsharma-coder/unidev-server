"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: { type: String, required: true, select: false },
    role: {
        type: String,
        enum: ['super_admin', 'admin', 'agent'],
        default: 'agent',
    },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
userSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();
    this.password = await bcryptjs_1.default.hash(this.password, 12);
    next();
});
userSchema.methods.comparePassword = function (candidate) {
    return bcryptjs_1.default.compare(candidate, this.password);
};
exports.User = (0, mongoose_1.model)('User', userSchema);
//# sourceMappingURL=User.model.js.map