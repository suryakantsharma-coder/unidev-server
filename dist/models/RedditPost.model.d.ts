import { Document } from 'mongoose';
export interface IRedditPost extends Document {
    redditId: string;
    /** Always 'reddit' — this collection is dedicated to Reddit-sourced posts */
    source: string;
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
    postCreatedAt?: Date;
    crawledAt?: Date;
    /** Full original payload from the scraper, untouched */
    raw: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
}
export declare const RedditPost: import("mongoose").Model<IRedditPost, {}, {}, {}, Document<unknown, {}, IRedditPost, {}, {}> & IRedditPost & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=RedditPost.model.d.ts.map