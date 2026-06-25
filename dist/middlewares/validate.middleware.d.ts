import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
declare const chatInputSchema: z.ZodObject<{
    messages: z.ZodArray<z.ZodObject<{
        role: z.ZodEnum<["user", "assistant"]>;
        content: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        role: "user" | "assistant";
        content: string;
    }, {
        role: "user" | "assistant";
        content: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    messages: {
        role: "user" | "assistant";
        content: string;
    }[];
}, {
    messages: {
        role: "user" | "assistant";
        content: string;
    }[];
}>;
export type ValidatedChatInput = z.infer<typeof chatInputSchema>;
declare const leadBodySchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    company: z.ZodOptional<z.ZodString>;
    budget: z.ZodOptional<z.ZodString>;
    timeline: z.ZodOptional<z.ZodString>;
    projectSummary: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    projectSummary: string;
    company?: string | undefined;
    budget?: string | undefined;
    timeline?: string | undefined;
}, {
    name: string;
    email: string;
    projectSummary: string;
    company?: string | undefined;
    budget?: string | undefined;
    timeline?: string | undefined;
}>;
export type ValidatedLeadBody = z.infer<typeof leadBodySchema>;
export declare function validateLeadBody(req: Request, _res: Response, next: NextFunction): void;
export declare function validateChatInput(req: Request, _res: Response, next: NextFunction): void;
export {};
//# sourceMappingURL=validate.middleware.d.ts.map