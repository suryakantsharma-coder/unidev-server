"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatInput = chatInput;
exports.chatOutput = chatOutput;
const chat_service_1 = require("../services/chat.service");
const email_service_1 = require("../services/email.service");
const sse_1 = require("../utils/sse");
const logger_1 = require("../utils/logger");
async function chatInput(req, res, next) {
    try {
        const { messages } = req.body;
        (0, logger_1.logChatInput)(messages);
        (0, logger_1.logTest)("POST /api/chat/input body", req.body);
        await (0, chat_service_1.acceptChatInput)(messages);
        (0, logger_1.logTestLine)("POST /api/chat/input", "response 200");
        res.status(200).json({ success: true });
    }
    catch (err) {
        (0, logger_1.logTest)("POST /api/chat/input error", err.message);
        next(err);
    }
}
async function chatOutput(req, res, next) {
    const { messages } = req.body;
    const abortController = new AbortController();
    req.on("close", () => {
        if (!res.writableEnded) {
            abortController.abort();
        }
    });
    try {
        (0, logger_1.logChatInput)(messages);
        (0, logger_1.logTest)("POST /api/chat/output body", req.body);
        (0, sse_1.setupSse)(res);
        (0, sse_1.sendSseInitial)(res);
        (0, logger_1.logTestLine)("POST /api/chat/output", "SSE started");
        const stream = await (0, chat_service_1.streamChatResponse)(messages, abortController.signal);
        let fullContent = "";
        for await (const chunk of stream) {
            if ((0, sse_1.isSseConnectionClosed)(res))
                break;
            const delta = chunk.choices[0]?.delta?.content;
            if (typeof delta === "string") {
                fullContent += delta;
                (0, logger_1.logTest)("POST /api/chat/output SSE chunk", { content: delta });
                (0, sse_1.sendSseChunk)(res, { content: delta });
            }
        }
        console.log({
            fullContent,
            isSseConnectionClosed: (0, sse_1.isSseConnectionClosed)(res),
        });
        if (fullContent && !(0, sse_1.isSseConnectionClosed)(res)) {
            (0, logger_1.logChatOutput)(fullContent);
            (0, logger_1.logTest)("POST /api/chat/output assistant full", { content: fullContent });
            await (0, chat_service_1.saveAssistantMessage)(fullContent);
            if (isTestEmailRequest(messages)) {
                try {
                    await (0, email_service_1.sendTestLeadEmail)();
                    (0, logger_1.logTestLine)("POST /api/chat/output", "test email sent");
                }
                catch (err) {
                    (0, logger_1.logTest)("POST /api/chat/output test email error", err.message);
                }
            }
        }
        if (!(0, sse_1.isSseConnectionClosed)(res)) {
            (0, logger_1.logTestLine)("POST /api/chat/output", "SSE data: [DONE]");
            (0, sse_1.sendSseDone)(res);
        }
        res.end();
    }
    catch (err) {
        (0, logger_1.logTest)("POST /api/chat/output error", err.message);
        if (!res.headersSent) {
            next(err);
            return;
        }
        try {
            (0, sse_1.sendSseChunk)(res, { error: err.message });
            (0, logger_1.logTest)("POST /api/chat/output SSE error", {
                error: err.message,
            });
            (0, sse_1.sendSseDone)(res);
            res.end();
        }
        catch {
            res.end();
        }
    }
}
function isTestEmailRequest(messages) {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    const text = (lastUser?.content ?? "").toLowerCase().trim();
    return (/send\s+(a\s+)?test\s+email/i.test(text) ||
        /test\s+email/i.test(text) ||
        /send\s+test\s+mail/i.test(text) ||
        text === "test email");
}
//# sourceMappingURL=chat.controller.js.map