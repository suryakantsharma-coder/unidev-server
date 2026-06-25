"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = create;
exports.bulkCreate = bulkCreate;
exports.list = list;
exports.getOne = getOne;
exports.update = update;
exports.remove = remove;
exports.search = search;
exports.bulkDelete = bulkDelete;
const zod_1 = require("zod");
const leadService = __importStar(require("../services/lead.service"));
const STATUSES = ['New', 'Contacted', 'Proposal', 'Negotiation', 'Qualified', 'Won', 'Lost'];
const PRIORITIES = ['high', 'medium', 'low'];
const leadSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(500),
    categories: zod_1.z.array(zod_1.z.string()).optional(),
    categoryName: zod_1.z.string().max(200).optional(),
    address: zod_1.z.string().max(1000).optional(),
    neighborhood: zod_1.z.string().max(300).optional(),
    street: zod_1.z.string().max(500).optional(),
    city: zod_1.z.string().max(100).optional(),
    state: zod_1.z.string().max(100).optional(),
    postalCode: zod_1.z.string().max(20).optional(),
    countryCode: zod_1.z.string().max(5).optional(),
    website: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
    phone: zod_1.z.string().max(30).optional(),
    phoneUnformatted: zod_1.z.string().max(30).optional(),
    location: zod_1.z.object({ lat: zod_1.z.number(), lng: zod_1.z.number() }).optional(),
    plusCode: zod_1.z.string().max(20).optional(),
    status: zod_1.z.enum(STATUSES).optional(),
    priority: zod_1.z.enum(PRIORITIES).optional(),
    notes: zod_1.z.string().max(5000).optional(),
    metadata: zod_1.z.record(zod_1.z.unknown()).optional(),
});
async function create(req, res, next) {
    try {
        const input = leadSchema.parse(req.body);
        const lead = await leadService.createLead(input);
        res.status(201).json({ success: true, data: lead });
    }
    catch (err) {
        next(err);
    }
}
const bulkCreateSchema = zod_1.z.object({
    categoryId: zod_1.z.string().optional(),
    leads: zod_1.z.array(leadSchema).min(1).max(5000),
});
async function bulkCreate(req, res, next) {
    try {
        const { categoryId, leads } = bulkCreateSchema.parse(req.body);
        const result = await leadService.bulkCreateLeads(leads, categoryId);
        res.status(201).json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
async function list(req, res, next) {
    try {
        const { search, status, priority, city, state, countryCode, categoryName, category, hasWebsite, dateFrom, dateTo, page, limit, sortBy, sortOrder } = req.query;
        const result = await leadService.listLeads({
            search: search,
            status: status,
            priority: priority,
            city: city,
            state: state,
            countryCode: countryCode,
            categoryName: categoryName,
            category: category,
            hasWebsite: hasWebsite === 'true' ? true : hasWebsite === 'false' ? false : undefined,
            dateFrom: dateFrom,
            dateTo: dateTo,
            page: page ? parseInt(String(page)) : undefined,
            limit: limit ? parseInt(String(limit)) : undefined,
            sortBy: sortBy,
            sortOrder: sortOrder,
        });
        res.json({ success: true, ...result });
    }
    catch (err) {
        next(err);
    }
}
async function getOne(req, res, next) {
    try {
        const lead = await leadService.getLead(req.params.id);
        res.json({ success: true, data: lead });
    }
    catch (err) {
        next(err);
    }
}
async function update(req, res, next) {
    try {
        const input = leadSchema.partial().parse(req.body);
        const lead = await leadService.updateLead(req.params.id, input);
        res.json({ success: true, data: lead });
    }
    catch (err) {
        next(err);
    }
}
async function remove(req, res, next) {
    try {
        await leadService.deleteLead(req.params.id);
        res.json({ success: true, message: 'Lead deleted' });
    }
    catch (err) {
        next(err);
    }
}
async function search(req, res, next) {
    try {
        const q = String(req.query.q ?? '').trim();
        const limit = req.query.limit ? parseInt(String(req.query.limit)) : 20;
        if (!q) {
            res.status(400).json({ success: false, message: 'Query param "q" is required' });
            return;
        }
        // fields=title,phone,city  →  ['title', 'phone', 'city']
        // if not provided, search all fields
        let fields;
        if (req.query.fields) {
            const requested = String(req.query.fields).split(',').map((f) => f.trim());
            const invalid = requested.filter((f) => !leadService.SEARCHABLE_FIELDS.includes(f));
            if (invalid.length > 0) {
                res.status(400).json({
                    success: false,
                    message: `Invalid field(s): ${invalid.join(', ')}`,
                    allowedFields: leadService.SEARCHABLE_FIELDS,
                });
                return;
            }
            fields = requested;
        }
        const results = await leadService.searchLeads(q, fields, limit);
        res.json({
            success: true,
            total: results.length,
            searchedFields: fields ?? leadService.SEARCHABLE_FIELDS,
            data: results,
        });
    }
    catch (err) {
        next(err);
    }
}
async function bulkDelete(req, res, next) {
    try {
        const { ids } = zod_1.z.object({ ids: zod_1.z.array(zod_1.z.string()).min(1).max(1000) }).parse(req.body);
        const result = await leadService.bulkDeleteLeads(ids);
        res.json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=lead.controller.js.map