"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkUpsertPosts = bulkUpsertPosts;
exports.listPosts = listPosts;
exports.getPost = getPost;
const RedditPost_model_1 = require("../models/RedditPost.model");
async function bulkUpsertPosts(posts) {
    const result = { received: posts.length, upserted: 0, matched: 0, failed: 0, errors: [] };
    const operations = [];
    for (let i = 0; i < posts.length; i++) {
        const post = posts[i];
        const redditId = post.id ?? post.parsedId;
        if (!redditId) {
            result.failed++;
            result.errors.push({ index: i, reason: 'Missing required field: id' });
            continue;
        }
        operations.push({
            updateOne: {
                filter: { redditId },
                update: {
                    $set: {
                        redditId,
                        source: 'reddit',
                        dataType: post.dataType,
                        title: post.title,
                        body: post.body,
                        authorName: post.authorName,
                        communityName: post.communityName,
                        upVotes: post.upVotes,
                        commentsCount: post.commentsCount,
                        postUrl: post.postUrl,
                        flair: post.flair,
                        searchTerm: post.searchTerm,
                        postCreatedAt: post.createdAt ? new Date(post.createdAt) : undefined,
                        crawledAt: post.crawledAt ? new Date(post.crawledAt) : undefined,
                        raw: post,
                    },
                },
                upsert: true,
            },
        });
    }
    if (operations.length > 0) {
        const bulkResult = await RedditPost_model_1.RedditPost.bulkWrite(operations, { ordered: false });
        result.upserted = bulkResult.upsertedCount ?? 0;
        result.matched = bulkResult.matchedCount ?? 0;
    }
    return result;
}
async function listPosts(filters) {
    const query = {};
    if (filters.search)
        query.$text = { $search: filters.search };
    if (filters.communityName)
        query.communityName = filters.communityName;
    if (filters.searchTerm)
        query.searchTerm = filters.searchTerm;
    if (filters.dateFrom || filters.dateTo) {
        const range = {};
        if (filters.dateFrom)
            range.$gte = new Date(filters.dateFrom);
        if (filters.dateTo)
            range.$lte = new Date(filters.dateTo);
        query.postCreatedAt = range;
    }
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(200, filters.limit ?? 20);
    const skip = (page - 1) * limit;
    const [posts, total] = await Promise.all([
        RedditPost_model_1.RedditPost.find(query).sort({ postCreatedAt: -1 }).skip(skip).limit(limit).lean(),
        RedditPost_model_1.RedditPost.countDocuments(query),
    ]);
    return { posts, total, page, limit, pages: Math.ceil(total / limit) };
}
async function getPost(id) {
    const post = await RedditPost_model_1.RedditPost.findById(id).lean();
    if (!post)
        throw Object.assign(new Error('Reddit post not found'), { statusCode: 404 });
    return post;
}
//# sourceMappingURL=redditPost.service.js.map