import { Request, Response, NextFunction } from "express";
import { ApiSuccessResponse, ApiErrorResponse } from "../types/chat.types";
import { ValidatedLeadBody } from "../middlewares/validate.middleware";
export declare function sendTestEmail(_req: Request, res: Response<ApiSuccessResponse | ApiErrorResponse>, next: NextFunction): Promise<void>;
export declare function sendLeadFromEndpoint(req: Request<object, ApiSuccessResponse | ApiErrorResponse, ValidatedLeadBody>, res: Response<ApiSuccessResponse | ApiErrorResponse>, next: NextFunction): Promise<void>;
//# sourceMappingURL=email.controller.d.ts.map