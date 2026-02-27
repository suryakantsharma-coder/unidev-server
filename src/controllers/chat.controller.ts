import { Request, Response, NextFunction } from "express";
import {
  acceptChatInput,
  streamChatResponse,
  saveAssistantMessage,
} from "../services/chat.service";
import { sendTestLeadEmail } from "../services/email.service";
import {
  setupSse,
  sendSseInitial,
  sendSseChunk,
  sendSseDone,
  isSseConnectionClosed,
} from "../utils/sse";
import { ValidatedChatInput } from "../middlewares/validate.middleware";
import { ApiSuccessResponse } from "../types/chat.types";
import {
  logTest,
  logTestLine,
  logChatInput,
  logChatOutput,
} from "../utils/logger";

export async function chatInput(
  req: Request<object, ApiSuccessResponse, ValidatedChatInput>,
  res: Response<ApiSuccessResponse>,
  next: NextFunction,
): Promise<void> {
  try {
    const { messages } = req.body;
    logChatInput(messages);
    logTest("POST /api/chat/input body", req.body);
    await acceptChatInput(messages);
    logTestLine("POST /api/chat/input", "response 200");
    res.status(200).json({ success: true });
  } catch (err) {
    logTest("POST /api/chat/input error", (err as Error).message);
    next(err);
  }
}

export async function chatOutput(
  req: Request<object, unknown, ValidatedChatInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const { messages } = req.body;
  const abortController = new AbortController();

  req.on("close", () => {
    if (!res.writableEnded) {
      abortController.abort();
    }
  });

  try {
    logChatInput(messages);
    logTest("POST /api/chat/output body", req.body);
    setupSse(res);
    sendSseInitial(res);
    logTestLine("POST /api/chat/output", "SSE started");
    const stream = await streamChatResponse(messages, abortController.signal);
    let fullContent = "";

    for await (const chunk of stream) {
      if (isSseConnectionClosed(res)) break;
      const delta = chunk.choices[0]?.delta?.content;
      if (typeof delta === "string") {
        fullContent += delta;
        logTest("POST /api/chat/output SSE chunk", { content: delta });
        sendSseChunk(res, { content: delta });
      }
    }

    console.log({
      fullContent,
      isSseConnectionClosed: isSseConnectionClosed(res),
    });

    if (fullContent && !isSseConnectionClosed(res)) {
      logChatOutput(fullContent);
      logTest("POST /api/chat/output assistant full", { content: fullContent });
      await saveAssistantMessage(fullContent);
      if (isTestEmailRequest(messages)) {
        try {
          await sendTestLeadEmail();
          logTestLine("POST /api/chat/output", "test email sent");
        } catch (err) {
          logTest(
            "POST /api/chat/output test email error",
            (err as Error).message,
          );
        }
      }
    }
    if (!isSseConnectionClosed(res)) {
      logTestLine("POST /api/chat/output", "SSE data: [DONE]");
      sendSseDone(res);
    }
    res.end();
  } catch (err) {
    logTest("POST /api/chat/output error", (err as Error).message);
    if (!res.headersSent) {
      next(err);
      return;
    }
    try {
      sendSseChunk(res, { error: (err as Error).message });
      logTest("POST /api/chat/output SSE error", {
        error: (err as Error).message,
      });
      sendSseDone(res);
      res.end();
    } catch {
      res.end();
    }
  }
}

function isTestEmailRequest(
  messages: Array<{ role: string; content: string }>,
): boolean {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const text = (lastUser?.content ?? "").toLowerCase().trim();
  return (
    /send\s+(a\s+)?test\s+email/i.test(text) ||
    /test\s+email/i.test(text) ||
    /send\s+test\s+mail/i.test(text) ||
    text === "test email"
  );
}
