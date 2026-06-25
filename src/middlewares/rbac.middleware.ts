import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/User.model';

/**
 * Returns middleware that allows only the specified roles.
 * Must be used after authMiddleware.
 *
 * Usage: router.get('/admin-only', authMiddleware, requireRoles('super_admin', 'admin'), handler)
 */
export function requireRoles(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthenticated' });
      return;
    }
    if (!roles.includes(req.user.role as UserRole)) {
      res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`,
      });
      return;
    }
    next();
  };
}

// Convenience shorthands
export const requireSuperAdmin = requireRoles('super_admin');
export const requireAdmin = requireRoles('super_admin', 'admin');
export const requireAgent = requireRoles('super_admin', 'admin', 'agent');
