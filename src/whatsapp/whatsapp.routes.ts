import { Router, Request, Response } from "express";
import { getWhatsAppClient, isWhatsAppReady } from "./whatsapp.client";

const router = Router();

router.get("/health", (_req: Request, res: Response) => {
  res.json({
    ok: true,
    whatsappReady: isWhatsAppReady(),
  });
});

router.post("/send-message", async (req: Request, res: Response) => {
  const { phone, message } = (req.body ?? {}) as {
    phone?: unknown;
    message?: unknown;
  };

  if (!phone || !message) {
    res.status(400).json({
      success: false,
      message: "phone and message are required",
    });
    return;
  }

  if (!isWhatsAppReady()) {
    res.status(503).json({
      success: false,
      message: "WhatsApp client is not ready yet (scan QR if needed)",
    });
    return;
  }

  const chatId = `${String(phone).replace(/[^\d]/g, "")}@c.us`;

  try {
    const wa = getWhatsAppClient();
    await wa.sendMessage(chatId, String(message));
    res.json({ success: true, status: "Message sent", to: chatId });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, message: msg });
  }
});

export default router;
