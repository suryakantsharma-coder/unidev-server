"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const whatsapp_client_1 = require("./whatsapp.client");
const router = (0, express_1.Router)();
router.get("/health", (_req, res) => {
    res.json({
        ok: true,
        whatsappReady: (0, whatsapp_client_1.isWhatsAppReady)(),
    });
});
/**
 * Start WhatsApp login on demand. Returns QR as data URL until scanned, or authenticated if session exists.
 * Body (optional): { "force": true } — destroy session / pending QR and start a new login (after logout or stuck state).
 */
router.post("/login", async (req, res) => {
    const force = req.body &&
        typeof req.body === "object" &&
        req.body.force === true;
    try {
        const result = await (0, whatsapp_client_1.requestWhatsAppLogin)({ force });
        if (!result.success) {
            const status = result.code === "pending"
                ? 409
                : result.code === "busy"
                    ? 429
                    : result.code === "disabled"
                        ? 503
                        : result.code === "timeout"
                            ? 504
                            : 500;
            res.status(status).json({
                success: false,
                code: result.code,
                message: result.message,
            });
            return;
        }
        if (result.authenticated) {
            res.json({
                success: true,
                authenticated: true,
                message: "WhatsApp session is active.",
            });
            return;
        }
        res.json({
            success: true,
            authenticated: false,
            qr: result.qr,
            qrDataUrl: result.qrDataUrl,
            message: "Scan this QR with WhatsApp (Linked devices).",
        });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        res.status(500).json({ success: false, message });
    }
});
router.post("/send-message", async (req, res) => {
    const { phone, message } = (req.body ?? {});
    if (!phone || !message) {
        res.status(400).json({
            success: false,
            message: "phone and message are required",
        });
        return;
    }
    if (!(0, whatsapp_client_1.isWhatsAppReady)()) {
        res.status(503).json({
            success: false,
            message: "WhatsApp is not connected. Call POST /api/whatsapp/login first and scan the QR.",
        });
        return;
    }
    const chatId = `${String(phone).replace(/[^\d]/g, "")}@c.us`;
    try {
        const wa = (0, whatsapp_client_1.getWhatsAppClient)();
        await wa.sendMessage(chatId, String(message));
        res.json({ success: true, status: "Message sent", to: chatId });
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        res.status(500).json({ success: false, message: msg });
    }
});
exports.default = router;
//# sourceMappingURL=whatsapp.routes.js.map