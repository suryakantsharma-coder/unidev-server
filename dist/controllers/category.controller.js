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
const categoryService = __importStar(require("../services/category.service"));
const categorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    description: zod_1.z.string().max(500).optional(),
    color: zod_1.z.string().max(20).optional(),
    isActive: zod_1.z.boolean().optional(),
});
async function create(req, res, next) {
    try {
        const input = categorySchema.parse(req.body);
        const category = await categoryService.createCategory(input);
        res.status(201).json({ success: true, data: category });
    }
    catch (err) {
        next(err);
    }
}
async function list(req, res, next) {
    try {
        const includeInactive = req.query.includeInactive === 'true';
        const categories = await categoryService.listCategories(includeInactive);
        res.json({ success: true, data: categories });
    }
    catch (err) {
        next(err);
    }
}
async function getOne(req, res, next) {
    try {
        const category = await categoryService.getCategory(req.params.id);
        res.json({ success: true, data: category });
    }
    catch (err) {
        next(err);
    }
}
async function update(req, res, next) {
    try {
        const input = categorySchema.partial().parse(req.body);
        const category = await categoryService.updateCategory(req.params.id, input);
        res.json({ success: true, data: category });
    }
    catch (err) {
        next(err);
    }
}
async function remove(req, res, next) {
    try {
        await categoryService.deleteCategory(req.params.id);
        res.json({ success: true, message: 'Category deleted' });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=category.controller.js.map