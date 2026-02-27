import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

const chatInputSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })
    )
    .min(1, 'messages must be a non-empty array'),
});

export type ValidatedChatInput = z.infer<typeof chatInputSchema>;

const leadBodySchema = z.object({
  name: z.string().min(1, 'name is required'),
  email: z.string().email('invalid email'),
  company: z.string().optional(),
  budget: z.string().optional(),
  timeline: z.string().optional(),
  projectSummary: z.string().min(1, 'projectSummary is required'),
});

export type ValidatedLeadBody = z.infer<typeof leadBodySchema>;

export function validateLeadBody(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  try {
    req.body = leadBodySchema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const message = err.errors.map((e) => e.message).join('; ');
      next(Object.assign(new Error(message), { statusCode: 400 }));
      return;
    }
    next(err);
  }
}

export function validateChatInput(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  try {
    req.body = chatInputSchema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const message = err.errors.map((e) => e.message).join('; ');
      next(Object.assign(new Error(message), { statusCode: 400 }));
      return;
    }
    next(err);
  }
}
