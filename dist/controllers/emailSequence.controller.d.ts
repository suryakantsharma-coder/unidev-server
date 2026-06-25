import { Request, Response, NextFunction } from 'express';
export declare function startSequence(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function listSequences(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getSequence(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function cancelSequence(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function listProgress(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getProgress(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getSequencesByLead(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=emailSequence.controller.d.ts.map