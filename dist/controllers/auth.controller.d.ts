import { Request, Response, NextFunction } from 'express';
export declare function register(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function login(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function me(req: Request, res: Response): Promise<void>;
/**
 * POST /api/auth/setup
 * One-time endpoint to create the first super admin.
 * Automatically disabled once any super_admin exists in the database.
 */
export declare function setup(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=auth.controller.d.ts.map