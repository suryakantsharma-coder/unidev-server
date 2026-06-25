"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFollowUp = createFollowUp;
exports.getFollowUpsByLead = getFollowUpsByLead;
exports.listFollowUps = listFollowUps;
exports.getFollowUp = getFollowUp;
exports.updateFollowUp = updateFollowUp;
exports.deleteFollowUp = deleteFollowUp;
exports.countDueToday = countDueToday;
const FollowUp_model_1 = require("../models/FollowUp.model");
const mongoose_1 = require("mongoose");
async function createFollowUp(input) {
    return FollowUp_model_1.FollowUp.create(input);
}
async function getFollowUpsByLead(leadId) {
    return FollowUp_model_1.FollowUp.find({ leadId: new mongoose_1.Types.ObjectId(leadId) })
        .populate('assignedUser', 'name email')
        .populate('leadId', 'title phone website')
        .sort({ scheduledAt: 1 })
        .lean();
}
async function listFollowUps(filters) {
    const query = {};
    if (filters.assignedUser)
        query.assignedUser = new mongoose_1.Types.ObjectId(filters.assignedUser);
    if (filters.contact)
        query.contact = new mongoose_1.Types.ObjectId(filters.contact);
    if (filters.leadId)
        query.leadId = new mongoose_1.Types.ObjectId(filters.leadId);
    if (filters.status)
        query.status = filters.status;
    if (filters.dateFrom || filters.dateTo) {
        const range = {};
        if (filters.dateFrom)
            range.$gte = new Date(filters.dateFrom);
        if (filters.dateTo)
            range.$lte = new Date(filters.dateTo);
        query.scheduledAt = range;
    }
    if (filters.dueToday) {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        query.scheduledAt = { $gte: start, $lte: end };
        query.status = 'pending';
    }
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(100, filters.limit ?? 20);
    const skip = (page - 1) * limit;
    const [followUps, total] = await Promise.all([
        FollowUp_model_1.FollowUp.find(query)
            .populate('contact', 'name phone')
            .populate('leadId', 'title phone website city')
            .populate('assignedUser', 'name email')
            .sort({ scheduledAt: 1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        FollowUp_model_1.FollowUp.countDocuments(query),
    ]);
    return { followUps, total, page, limit, pages: Math.ceil(total / limit) };
}
async function getFollowUp(id) {
    const fu = await FollowUp_model_1.FollowUp.findById(id)
        .populate('contact', 'name phone email')
        .populate('leadId', 'title phone website city categoryName')
        .populate('assignedUser', 'name email');
    if (!fu)
        throw Object.assign(new Error('Follow-up not found'), { statusCode: 404 });
    return fu;
}
async function updateFollowUp(id, input) {
    const update = { ...input };
    if (input.status === 'completed')
        update.completedAt = new Date();
    const fu = await FollowUp_model_1.FollowUp.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    if (!fu)
        throw Object.assign(new Error('Follow-up not found'), { statusCode: 404 });
    return fu;
}
async function deleteFollowUp(id) {
    const fu = await FollowUp_model_1.FollowUp.findByIdAndDelete(id);
    if (!fu)
        throw Object.assign(new Error('Follow-up not found'), { statusCode: 404 });
}
/** Count follow-ups due today across all users */
async function countDueToday() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return FollowUp_model_1.FollowUp.countDocuments({ scheduledAt: { $gte: start, $lte: end }, status: 'pending' });
}
//# sourceMappingURL=followUp.service.js.map