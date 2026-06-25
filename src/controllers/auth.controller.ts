import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { registerUser, loginUser } from '../services/auth.service';
import { User } from '../models/User.model';

const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['super_admin', 'admin', 'agent']).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = registerSchema.parse(req.body);
    const result = await registerUser(input);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = loginSchema.parse(req.body);
    const result = await loginUser(input);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response): Promise<void> {
  res.json({ success: true, data: req.user });
}

/**
 * POST /api/auth/setup
 * One-time endpoint to create the first super admin.
 * Automatically disabled once any super_admin exists in the database.
 */
export async function setup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const superAdminExists = await User.exists({ role: 'super_admin' });
    if (superAdminExists) {
      res.status(403).json({
        success: false,
        message: 'Setup already completed. Use /api/auth/login to sign in.',
      });
      return;
    }

    const input = registerSchema.parse(req.body);
    const result = await registerUser({ ...input, role: 'super_admin' });
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
