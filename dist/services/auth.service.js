"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = registerUser;
exports.loginUser = loginUser;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_model_1 = require("../models/User.model");
const env_1 = require("../config/env");
function signToken(userId, role) {
    const options = { expiresIn: env_1.env.JWT_EXPIRES_IN };
    return jsonwebtoken_1.default.sign({ id: userId, role }, env_1.env.JWT_SECRET, options);
}
async function registerUser(input) {
    const existing = await User_model_1.User.findOne({ email: input.email });
    if (existing)
        throw Object.assign(new Error('Email already registered'), { statusCode: 409 });
    const user = await User_model_1.User.create({
        name: input.name,
        email: input.email,
        password: input.password,
        role: input.role ?? 'agent',
    });
    const token = signToken(String(user._id), user.role);
    return { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } };
}
async function loginUser(input) {
    const user = await User_model_1.User.findOne({ email: input.email }).select('+password');
    if (!user || !user.isActive) {
        throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });
    }
    const match = await user.comparePassword(input.password);
    if (!match)
        throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });
    const token = signToken(String(user._id), user.role);
    return { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } };
}
//# sourceMappingURL=auth.service.js.map