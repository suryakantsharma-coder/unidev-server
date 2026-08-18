"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedditPost = void 0;
const mongoose_1 = require("mongoose");
const redditPostSchema = new mongoose_1.Schema({
    redditId: { type: String, required: true, unique: true, trim: true },
    source: { type: String, required: true, default: 'reddit', immutable: true },
    dataType: { type: String, trim: true },
    title: { type: String, trim: true },
    body: { type: String },
    authorName: { type: String, trim: true },
    communityName: { type: String, trim: true },
    upVotes: { type: Number },
    commentsCount: { type: Number },
    postUrl: { type: String, trim: true },
    flair: { type: String, trim: true },
    searchTerm: { type: String, trim: true },
    postCreatedAt: { type: Date },
    crawledAt: { type: Date },
    raw: { type: mongoose_1.Schema.Types.Mixed, required: true },
}, { timestamps: true });
redditPostSchema.index({ source: 1 });
redditPostSchema.index({ communityName: 1 });
redditPostSchema.index({ searchTerm: 1 });
redditPostSchema.index({ postCreatedAt: -1 });
redditPostSchema.index({ createdAt: -1 });
redditPostSchema.index({ title: 'text', body: 'text', authorName: 'text' });
exports.RedditPost = (0, mongoose_1.model)('RedditPost', redditPostSchema);
//# sourceMappingURL=RedditPost.model.js.map