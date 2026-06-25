import { Document } from 'mongoose';
export interface IWebhookLog extends Document {
    source: string;
    event?: string;
    payload: Record<string, unknown>;
    receivedAt: Date;
    processed: boolean;
    processingError?: string;
}
export declare const WebhookLog: import("mongoose").Model<IWebhookLog, {}, {}, {}, Document<unknown, {}, IWebhookLog, {}, {}> & IWebhookLog & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=WebhookLog.model.d.ts.map