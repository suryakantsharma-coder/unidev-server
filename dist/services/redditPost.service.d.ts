export interface RedditPostInput {
    id?: string;
    parsedId?: string;
    dataType?: string;
    title?: string;
    body?: string;
    authorName?: string;
    communityName?: string;
    upVotes?: number;
    commentsCount?: number;
    postUrl?: string;
    flair?: string | null;
    searchTerm?: string;
    createdAt?: string;
    crawledAt?: string;
    [key: string]: unknown;
}
export interface BulkUpsertResult {
    received: number;
    upserted: number;
    matched: number;
    failed: number;
    errors: Array<{
        index: number;
        reason: string;
    }>;
}
export declare function bulkUpsertPosts(posts: RedditPostInput[]): Promise<BulkUpsertResult>;
export interface RedditPostFilters {
    search?: string;
    communityName?: string;
    searchTerm?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
}
export declare function listPosts(filters: RedditPostFilters): Promise<{
    posts: (import("mongoose").FlattenMaps<import("../models/RedditPost.model").IRedditPost> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[];
    total: number;
    page: number;
    limit: number;
    pages: number;
}>;
export declare function getPost(id: string): Promise<import("mongoose").FlattenMaps<import("../models/RedditPost.model").IRedditPost> & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}>;
//# sourceMappingURL=redditPost.service.d.ts.map