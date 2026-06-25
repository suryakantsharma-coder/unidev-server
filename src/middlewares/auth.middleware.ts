import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { User } from '../models/User.model';

interface JwtPayload {
  id: string;
  role: string;
}

/**
 * Verifies the Bearer JWT and attaches req.user.
 * Must run before any protected route handler.
 */
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Missing or invalid Authorization header' });
    return;
  }

  const token = authHeader.slice(7);
  let payload: JwtPayload;

  try {
    payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
    return;
  }

  const user = await User.findById(payload.id).select('name email role isActive').lean();
  if (!user || !user.isActive) {
    res.status(401).json({ success: false, message: 'User not found or deactivated' });
    return;
  }

  req.user = { _id: user._id, name: user.name, email: user.email, role: user.role } as typeof req.user;
  next();
}
