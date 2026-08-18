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
exports.bulkIngest = bulkIngest;
exports.list = list;
exports.getOne = getOne;
const zod_1 = require("zod");
const redditPostService = __importStar(require("../services/redditPost.service"));
const postSchema = zod_1.z
    .object({
    id: zod_1.z.string().optional(),
    parsedId: zod_1.z.string().optional(),
    dataType: zod_1.z.string().optional(),
    title: zod_1.z.string().optional(),
    body: zod_1.z.string().optional(),
    authorName: zod_1.z.string().optional(),
    communityName: zod_1.z.string().optional(),
    upVotes: zod_1.z.number().optional(),
    commentsCount: zod_1.z.number().optional(),
    postUrl: zod_1.z.string().optional(),
    flair: zod_1.z.string().nullable().optional(),
    searchTerm: zod_1.z.string().optional(),
    createdAt: zod_1.z.string().optional(),
    crawledAt: zod_1.z.string().optional(),
})
    .passthrough();
const postsArraySchema = zod_1.z.array(postSchema).min(1).max(2000);
async function bulkIngest(req, res, next) {
    try {
        const body = req.body;
        // n8n's HTTP Request node commonly sends one item per execution, so accept
        // any of: a bare array, { posts: [...] }, or a single post object.
        let rawPosts;
        if (Array.isArray(body)) {
            rawPosts = body;
        }
        else if (body && Array.isArray(body.posts)) {
            rawPosts = body.posts;
        }
        else {
            rawPosts = [body];
        }
        const posts = postsArraySchema.parse(rawPosts);
        const result = await redditPostService.bulkUpsertPosts(posts);
        res.status(201).json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
async function list(req, res, next) {
    try {
        const { search, communityName, searchTerm, dateFrom, dateTo, page, limit } = req.query;
        const result = await redditPostService.listPosts({
            search: search,
            communityName: communityName,
            searchTerm: searchTerm,
            dateFrom: dateFrom,
            dateTo: dateTo,
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
        const post = await redditPostService.getPost(req.params.id);
        res.json({ success: true, data: post });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=redditPost.controller.js.map