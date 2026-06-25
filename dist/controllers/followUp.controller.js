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
exports.list = list;
exports.getByLead = getByLead;
exports.getOne = getOne;
exports.update = update;
exports.remove = remove;
const zod_1 = require("zod");
const followUpService = __importStar(require("../services/followUp.service"));
const followUpSchema = zod_1.z.object({
    contact: zod_1.z.string().optional(),
    leadId: zod_1.z.string().optional(),
    assignedUser: zod_1.z.string().optional(), // defaults to the logged-in user
    scheduledAt: zod_1.z.coerce.date(),
    message: zod_1.z.string().min(1).max(2000),
    notes: zod_1.z.string().max(2000).optional(),
});
const updateSchema = followUpSchema.partial().extend({
    status: zod_1.z.enum(['pending', 'completed', 'cancelled', 'overdue']).optional(),
});
async function create(req, res, next) {
    try {
        const input = followUpSchema.parse(req.body);
        const fu = await followUpService.createFollowUp({
            ...input,
            assignedUser: input.assignedUser ?? String(req.user._id),
        });
        res.status(201).json({ success: true, data: fu });
    }
    catch (err) {
        next(err);
    }
}
async function list(req, res, next) {
    try {
        const { assignedUser, contact, leadId, status, dateFrom, dateTo, dueToday, page, limit } = req.query;
        const result = await followUpService.listFollowUps({
            assignedUser: assignedUser,
            contact: contact,
            leadId: leadId,
            status: status,
            dateFrom: dateFrom,
            dateTo: dateTo,
            dueToday: dueToday === 'true',
            page: page ? parseInt(String(page)) : undefined,
            limit: limit ? parseInt(String(limit)) : undefined,
        });
        res.json({ success: true, ...result });
    }
    catch (err) {
        next(err);
    }
}
async function getByLead(req, res, next) {
    try {
        const followUps = await followUpService.getFollowUpsByLead(req.params.leadId);
        res.json({ success: true, total: followUps.length, data: followUps });
    }
    catch (err) {
        next(err);
    }
}
async function getOne(req, res, next) {
    try {
        const fu = await followUpService.getFollowUp(req.params.id);
        res.json({ success: true, data: fu });
    }
    catch (err) {
        next(err);
    }
}
async function update(req, res, next) {
    try {
        const input = updateSchema.parse(req.body);
        const fu = await followUpService.updateFollowUp(req.params.id, input);
        res.json({ success: true, data: fu });
    }
    catch (err) {
        next(err);
    }
}
async function remove(req, res, next) {
    try {
        await followUpService.deleteFollowUp(req.params.id);
        res.json({ success: true, message: 'Follow-up deleted' });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=followUp.controller.js.map