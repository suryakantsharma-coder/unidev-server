import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/User.model';
/**
 * Returns middleware that allows only the specified roles.
 * Must be used after authMiddleware.
 *
 * Usage: router.get('/admin-only', authMiddleware, requireRoles('super_admin', 'admin'), handler)
 */
export declare function requireRoles(...roles: UserRole[]): (req: Request, res: Response, next: NextFunction) => void;
export declare const requireSuperAdmin: (req: Request, res: Response, next: NextFunction) => void;
export declare const requireAdmin: (req: Request, res: Response, next: NextFunction) => void;
export declare const requireAgent: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=rbac.middleware.d.ts.map