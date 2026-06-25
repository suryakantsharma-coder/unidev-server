"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUsers = listUsers;
exports.updateUserRole = updateUserRole;
exports.deactivateUser = deactivateUser;
const zod_1 = require("zod");
const User_model_1 = require("../models/User.model");
const roleSchema = zod_1.z.object({
    role: zod_1.z.enum(['super_admin', 'admin', 'agent']),
});
async function listUsers(req, res, next) {
    try {
        const users = await User_model_1.User.find().select('-password').lean();
        res.json({ success: true, data: users });
    }
    catch (err) {
        next(err);
    }
}
async function updateUserRole(req, res, next) {
    try {
        const { role } = roleSchema.parse(req.body);
        const user = await User_model_1.User.findByIdAndUpdate(req.params.id, { role }, { new: true, runValidators: true }).select('-password');
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        res.json({ success: true, data: user });
    }
    catch (err) {
        next(err);
    }
}
async function deactivateUser(req, res, next) {
    try {
        const user = await User_model_1.User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true }).select('-password');
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        res.json({ success: true, data: user });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=user.controller.js.map