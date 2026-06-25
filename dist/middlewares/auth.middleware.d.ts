import { Request, Response, NextFunction } from 'express';
/**
 * Verifies the Bearer JWT and attaches req.user.
 * Must run before any protected route handler.
 */
export declare function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=auth.middleware.d.ts.map