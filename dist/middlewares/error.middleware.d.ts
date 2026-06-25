import { Request, Response, NextFunction } from 'express';
import { ApiErrorResponse } from '../types/chat.types';
interface AppError extends Error {
    statusCode?: number;
}
export declare function errorMiddleware(err: AppError, _req: Request, res: Response<ApiErrorResponse>, _next: NextFunction): void;
export declare function notFoundMiddleware(_req: Request, res: Response<ApiErrorResponse>): void;
export {};
//# sourceMappingURL=error.middleware.d.ts.map