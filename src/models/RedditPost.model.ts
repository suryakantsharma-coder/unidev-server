import { Document, Schema, model } from 'mongoose';

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

const redditPostSchema = new Schema<IRedditPost>(
  {
    redditId:      { type: String, required: true, unique: true, trim: true },
    source:        { type: String, required: true, default: 'reddit', immutable: true },
    dataType:      { type: String, trim: true },
    title:         { type: String, trim: true },
    body:          { type: String },
    authorName:    { type: String, trim: true },
    communityName: { type: String, trim: true },
    upVotes:       { type: Number },
    commentsCount: { type: Number },
    postUrl:       { type: String, trim: true },
    flair:         { type: String, trim: true },
    searchTerm:    { type: String, trim: true },
    postCreatedAt: { type: Date },
    crawledAt:     { type: Date },
    raw:           { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

redditPostSchema.index({ source: 1 });
redditPostSchema.index({ communityName: 1 });
redditPostSchema.index({ searchTerm: 1 });
redditPostSchema.index({ postCreatedAt: -1 });
redditPostSchema.index({ createdAt: -1 });
redditPostSchema.index({ title: 'text', body: 'text', authorName: 'text' });

export const RedditPost = model<IRedditPost>('RedditPost', redditPostSchema);
