"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.me = me;
exports.setup = setup;
const zod_1 = require("zod");
const auth_service_1 = require("../services/auth.service");
const User_model_1 = require("../models/User.model");
const registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    role: zod_1.z.enum(['super_admin', 'admin', 'agent']).optional(),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
});
async function register(req, res, next) {
    try {
        const input = registerSchema.parse(req.body);
        const result = await (0, auth_service_1.registerUser)(input);
        res.status(201).json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
async function login(req, res, next) {
    try {
        const input = loginSchema.parse(req.body);
        const result = await (0, auth_service_1.loginUser)(input);
        res.json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
async function me(req, res) {
    res.json({ success: true, data: req.user });
}
/**
 * POST /api/auth/setup
 * One-time endpoint to create the first super admin.
 * Automatically disabled once any super_admin exists in the database.
 */
async function setup(req, res, next) {
    try {
        const superAdminExists = await User_model_1.User.exists({ role: 'super_admin' });
        if (superAdminExists) {
            res.status(403).json({
                success: false,
                message: 'Setup already completed. Use /api/auth/login to sign in.',
            });
            return;
        }
        const input = registerSchema.parse(req.body);
        const result = await (0, auth_service_1.registerUser)({ ...input, role: 'super_admin' });
        res.status(201).json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=auth.controller.js.map