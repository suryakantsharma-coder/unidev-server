import { Request, Response, NextFunction } from "express";
import { ValidatedChatInput } from "../middlewares/validate.middleware";
import { ApiSuccessResponse } from "../types/chat.types";
export declare function chatInput(req: Request<object, ApiSuccessResponse, ValidatedChatInput>, res: Response<ApiSuccessResponse>, next: NextFunction): Promise<void>;
export declare function chatOutput(req: Request<object, unknown, ValidatedChatInput>, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=chat.controller.d.ts.map