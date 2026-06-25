"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const User_model_1 = require("../models/User.model");
/**
 * Verifies the Bearer JWT and attaches req.user.
 * Must run before any protected route handler.
 */
async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({ success: false, message: 'Missing or invalid Authorization header' });
        return;
    }
    const token = authHeader.slice(7);
    let payload;
    try {
        payload = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
    }
    catch {
        res.status(401).json({ success: false, message: 'Invalid or expired token' });
        return;
    }
    const user = await User_model_1.User.findById(payload.id).select('name email role isActive').lean();
    if (!user || !user.isActive) {
        res.status(401).json({ success: false, message: 'User not found or deactivated' });
        return;
    }
    req.user = { _id: user._id, name: user.name, email: user.email, role: user.role };
    next();
}
//# sourceMappingURL=auth.middleware.js.map