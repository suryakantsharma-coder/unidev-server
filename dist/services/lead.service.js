"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SEARCHABLE_FIELDS = void 0;
exports.createLead = createLead;
exports.bulkCreateLeads = bulkCreateLeads;
exports.listLeads = listLeads;
exports.getLead = getLead;
exports.updateLead = updateLead;
exports.searchLeads = searchLeads;
exports.deleteLead = deleteLead;
exports.bulkDeleteLeads = bulkDeleteLeads;
const mongoose_1 = require("mongoose");
const Lead_model_1 = require("../models/Lead.model");
async function createLead(input) {
    return Lead_model_1.Lead.create(input);
}
async function bulkCreateLeads(inputs, categoryId) {
    let inserted = 0;
    let duplicates = 0;
    let failed = 0;
    const errors = [];
    for (let i = 0; i < inputs.length; i++) {
        const item = inputs[i];
        try {
            // Deduplicate by phoneUnformatted or phone within this bulk operation
            const orConditions = [];
            if (item.phoneUnformatted)
                orConditions.push({ phoneUnformatted: item.phoneUnformatted });
            else if (item.phone)
                orConditions.push({ phone: item.phone });
            if (orConditions.length > 0) {
                const exists = await Lead_model_1.Lead.exists({ $or: orConditions });
                if (exists) {
                    duplicates++;
                    continue;
                }
            }
            // categoryId passed at upload level overrides any per-row category
            await Lead_model_1.Lead.create(categoryId ? { ...item, category: categoryId } : item);
            inserted++;
        }
        catch (err) {
            failed++;
            errors.push({
                index: i,
                title: item.title ?? '(unknown)',
                reason: err instanceof Error ? err.message : String(err),
            });
        }
    }
    return { inserted, duplicates, failed, errors };
}
async function listLeads(filters) {
    const query = {};
    if (filters.search) {
        query.$text = { $search: filters.search };
    }
    if (filters.status)
        query.status = filters.status;
    if (filters.priority)
        query.priority = filters.priority;
    if (filters.city)
        query.city = { $regex: filters.city, $options: 'i' };
    if (filters.state)
        query.state = { $regex: filters.state, $options: 'i' };
    if (filters.countryCode)
        query.countryCode = filters.countryCode.toUpperCase();
    if (filters.categoryName)
        query.categoryName = { $regex: filters.categoryName, $options: 'i' };
    if (filters.category)
        query.category = new mongoose_1.Types.ObjectId(filters.category);
    if (filters.hasWebsite === true)
        query.website = { $exists: true, $nin: ['', null] };
    if (filters.hasWebsite === false)
        query.$or = [{ website: { $exists: false } }, { website: '' }, { website: null }];
    if (filters.dateFrom || filters.dateTo) {
        const range = {};
        if (filters.dateFrom)
            range.$gte = new Date(filters.dateFrom);
        if (filters.dateTo)
            range.$lte = new Date(filters.dateTo);
        query.createdAt = range;
    }
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(200, filters.limit ?? 20);
    const skip = (page - 1) * limit;
    const sortField = filters.sortBy ?? 'createdAt';
    const sortDir = filters.sortOrder === 'asc' ? 1 : -1;
    const [leads, total] = await Promise.all([
        Lead_model_1.Lead.find(query)
            .populate('category', 'name color')
            .sort({ [sortField]: sortDir })
            .skip(skip)
            .limit(limit)
            .lean(),
        Lead_model_1.Lead.countDocuments(query),
    ]);
    return {
        leads,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
    };
}
async function getLead(id) {
    const lead = await Lead_model_1.Lead.findById(id).populate('category', 'name color description');
    if (!lead)
        throw Object.assign(new Error('Lead not found'), { statusCode: 404 });
    return lead;
}
async function updateLead(id, input) {
    const lead = await Lead_model_1.Lead.findByIdAndUpdate(id, input, { new: true, runValidators: true })
        .populate('category', 'name color');
    if (!lead)
        throw Object.assign(new Error('Lead not found'), { statusCode: 404 });
    return lead;
}
// All fields allowed for targeted search
exports.SEARCHABLE_FIELDS = [
    'title', 'phone', 'phoneUnformatted', 'city', 'state',
    'countryCode', 'categoryName', 'website', 'address',
    'neighborhood', 'street', 'postalCode', 'notes', 'plusCode',
];
async function searchLeads(q, fields = [...exports.SEARCHABLE_FIELDS], limit = 20) {
    if (!q.trim())
        return [];
    const regex = { $regex: q.trim(), $options: 'i' };
    const orConditions = fields.map((field) => ({ [field]: regex }));
    return Lead_model_1.Lead.find({ $or: orConditions })
        .populate('category', 'name color')
        .sort({ createdAt: -1 })
        .limit(Math.min(100, limit))
        .lean();
}
async function deleteLead(id) {
    const lead = await Lead_model_1.Lead.findByIdAndDelete(id);
    if (!lead)
        throw Object.assign(new Error('Lead not found'), { statusCode: 404 });
}
async function bulkDeleteLeads(ids) {
    const result = await Lead_model_1.Lead.deleteMany({ _id: { $in: ids } });
    const deleted = result.deletedCount;
    const notFound = ids.length - deleted;
    return { deleted, notFound };
}
//# sourceMappingURL=lead.service.js.map