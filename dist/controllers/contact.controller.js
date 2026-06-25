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
exports.getOne = getOne;
exports.update = update;
exports.remove = remove;
const zod_1 = require("zod");
const contactService = __importStar(require("../services/contact.service"));
const contactSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(200),
    phone: zod_1.z.string().min(7).max(20),
    email: zod_1.z.string().email().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    notes: zod_1.z.string().max(2000).optional(),
    assignedAgent: zod_1.z.string().optional(),
});
async function create(req, res, next) {
    try {
        const input = contactSchema.parse(req.body);
        const contact = await contactService.createContact(input);
        res.status(201).json({ success: true, data: contact });
    }
    catch (err) {
        next(err);
    }
}
async function list(req, res, next) {
    try {
        const { assignedAgent, tags, search, page, limit } = req.query;
        const result = await contactService.listContacts({
            assignedAgent: assignedAgent,
            tags: tags ? String(tags).split(',') : undefined,
            search: search,
            page: page ? parseInt(String(page)) : undefined,
            limit: limit ? parseInt(String(limit)) : undefined,
        });
        res.json({ success: true, ...result });
    }
    catch (err) {
        next(err);
    }
}
async function getOne(req, res, next) {
    try {
        const contact = await contactService.getContact(req.params.id);
        res.json({ success: true, data: contact });
    }
    catch (err) {
        next(err);
    }
}
async function update(req, res, next) {
    try {
        const input = contactSchema.partial().parse(req.body);
        const contact = await contactService.updateContact(req.params.id, input);
        res.json({ success: true, data: contact });
    }
    catch (err) {
        next(err);
    }
}
async function remove(req, res, next) {
    try {
        await contactService.deleteContact(req.params.id);
        res.json({ success: true, message: 'Contact deleted' });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=contact.controller.js.map