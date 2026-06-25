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
exports.list = list;
exports.getOne = getOne;
exports.updateStatus = updateStatus;
exports.assign = assign;
exports.getMessages = getMessages;
const zod_1 = require("zod");
const convService = __importStar(require("../services/conversation.service"));
const statusSchema = zod_1.z.object({
    status: zod_1.z.enum(['open', 'pending', 'closed']),
});
const assignSchema = zod_1.z.object({
    agentId: zod_1.z.string(),
});
async function list(req, res, next) {
    try {
        const { status, assignedAgent, page, limit } = req.query;
        const result = await convService.listConversations({
            status: status,
            assignedAgent: assignedAgent,
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
        const conv = await convService.getConversation(req.params.id);
        res.json({ success: true, data: conv });
    }
    catch (err) {
        next(err);
    }
}
async function updateStatus(req, res, next) {
    try {
        const { status } = statusSchema.parse(req.body);
        const conv = await convService.updateConversationStatus(req.params.id, status);
        res.json({ success: true, data: conv });
    }
    catch (err) {
        next(err);
    }
}
async function assign(req, res, next) {
    try {
        const { agentId } = assignSchema.parse(req.body);
        const conv = await convService.assignConversation(req.params.id, agentId);
        res.json({ success: true, data: conv });
    }
    catch (err) {
        next(err);
    }
}
async function getMessages(req, res, next) {
    try {
        const { page, limit } = req.query;
        const result = await convService.listMessages(req.params.id, page ? parseInt(String(page)) : undefined, limit ? parseInt(String(limit)) : undefined);
        res.json({ success: true, ...result });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=conversation.controller.js.map