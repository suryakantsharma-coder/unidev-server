import { Request, Response, NextFunction } from 'express';
/**
 * GET /api/webhooks/whatsapp
 * Meta sends this to verify the webhook URL during setup.
 */
export declare function verifyWebhook(req: Request, res: Response): void;
/**
 * POST /api/webhooks/whatsapp
 * Receives incoming messages, status updates, and other events from Meta.
 */
export declare function receiveWebhook(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=webhook.controller.d.ts.map