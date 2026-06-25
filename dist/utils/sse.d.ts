import { Response } from 'express';
export declare function setupSse(res: Response): void;
/** Send an initial event so the client receives a response immediately (avoids “no response” until first token). */
export declare function sendSseInitial(res: Response): void;
export declare function sendSseChunk(res: Response, data: unknown): void;
export declare const SSE_DONE: {
    readonly done: true;
};
export declare function sendSseDone(res: Response): void;
export declare function isSseConnectionClosed(res: Response): boolean;
//# sourceMappingURL=sse.d.ts.map