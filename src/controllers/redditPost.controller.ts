import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as redditPostService from '../services/redditPost.service';

const postSchema = z
  .object({
    id: z.string().optional(),
    parsedId: z.string().optional(),
    dataType: z.string().optional(),
    title: z.string().optional(),
    body: z.string().optional(),
    authorName: z.string().optional(),
    communityName: z.string().optional(),
    upVotes: z.number().optional(),
    commentsCount: z.number().optional(),
    postUrl: z.string().optional(),
    flair: z.string().nullable().optional(),
    searchTerm: z.string().optional(),
    createdAt: z.string().optional(),
    crawledAt: z.string().optional(),
  })
  .passthrough();

const postsArraySchema = z.array(postSchema).min(1).max(2000);

export async function bulkIngest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = req.body;

    // n8n's HTTP Request node commonly sends one item per execution, so accept
    // any of: a bare array, { posts: [...] }, or a single post object.
    let rawPosts: unknown;
    if (Array.isArray(body)) {
      rawPosts = body;
    } else if (body && Array.isArray(body.posts)) {
      rawPosts = body.posts;
    } else {
      rawPosts = [body];
    }

    const posts = postsArraySchema.parse(rawPosts);

    const result = await redditPostService.bulkUpsertPosts(posts);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { search, communityName, searchTerm, dateFrom, dateTo, page, limit } = req.query;

    const result = await redditPostService.listPosts({
      search: search as string,
      communityName: communityName as string,
      searchTerm: searchTerm as string,
      dateFrom: dateFrom as string,
      dateTo: dateTo as string,
      page: page ? parseInt(String(page)) : undefined,
      limit: limit ? parseInt(String(limit)) : undefined,
    });

    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const post = await redditPostService.getPost(req.params.id);
    res.json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
}
