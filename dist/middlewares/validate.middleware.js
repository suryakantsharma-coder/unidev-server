"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateLeadBody = validateLeadBody;
exports.validateChatInput = validateChatInput;
const zod_1 = require("zod");
const chatInputSchema = zod_1.z.object({
    messages: zod_1.z
        .array(zod_1.z.object({
        role: zod_1.z.enum(['user', 'assistant']),
        content: zod_1.z.string(),
    }))
        .min(1, 'messages must be a non-empty array'),
});
const leadBodySchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'name is required'),
    email: zod_1.z.string().email('invalid email'),
    company: zod_1.z.string().optional(),
    budget: zod_1.z.string().optional(),
    timeline: zod_1.z.string().optional(),
    projectSummary: zod_1.z.string().min(1, 'projectSummary is required'),
});
function validateLeadBody(req, _res, next) {
    try {
        req.body = leadBodySchema.parse(req.body);
        next();
    }
    catch (err) {
        if (err instanceof zod_1.ZodError) {
            const message = err.errors.map((e) => e.message).join('; ');
            next(Object.assign(new Error(message), { statusCode: 400 }));
            return;
        }
        next(err);
    }
}
function validateChatInput(req, _res, next) {
    try {
        req.body = chatInputSchema.parse(req.body);
        next();
    }
    catch (err) {
        if (err instanceof zod_1.ZodError) {
            const message = err.errors.map((e) => e.message).join('; ');
            next(Object.assign(new Error(message), { statusCode: 400 }));
            return;
        }
        next(err);
    }
}
//# sourceMappingURL=validate.middleware.js.map