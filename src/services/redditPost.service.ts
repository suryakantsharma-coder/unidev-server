import { RedditPost } from '../models/RedditPost.model';

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
  errors: Array<{ index: number; reason: string }>;
}

export async function bulkUpsertPosts(posts: RedditPostInput[]): Promise<BulkUpsertResult> {
  const result: BulkUpsertResult = { received: posts.length, upserted: 0, matched: 0, failed: 0, errors: [] };
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
    const bulkResult = await RedditPost.bulkWrite(operations, { ordered: false });
    result.upserted = bulkResult.upsertedCount ?? 0;
    result.matched = bulkResult.matchedCount ?? 0;
  }

  return result;
}

export interface RedditPostFilters {
  search?: string;
  communityName?: string;
  searchTerm?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export async function listPosts(filters: RedditPostFilters) {
  const query: Record<string, unknown> = {};

  if (filters.search) query.$text = { $search: filters.search };
  if (filters.communityName) query.communityName = filters.communityName;
  if (filters.searchTerm) query.searchTerm = filters.searchTerm;

  if (filters.dateFrom || filters.dateTo) {
    const range: Record<string, Date> = {};
    if (filters.dateFrom) range.$gte = new Date(filters.dateFrom);
    if (filters.dateTo) range.$lte = new Date(filters.dateTo);
    query.postCreatedAt = range;
  }

  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(200, filters.limit ?? 20);
  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    RedditPost.find(query).sort({ postCreatedAt: -1 }).skip(skip).limit(limit).lean(),
    RedditPost.countDocuments(query),
  ]);

  return { posts, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function getPost(id: string) {
  const post = await RedditPost.findById(id).lean();
  if (!post) throw Object.assign(new Error('Reddit post not found'), { statusCode: 404 });
  return post;
}
