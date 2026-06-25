"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isWhatsAppReady = isWhatsAppReady;
exports.getWhatsAppClient = getWhatsAppClient;
exports.requestWhatsAppLogin = requestWhatsAppLogin;
exports.shutdownWhatsAppClient = shutdownWhatsAppClient;
const node_os_1 = require("node:os");
const qrcode_1 = __importDefault(require("qrcode"));
const whatsapp_web_js_1 = require("whatsapp-web.js");
const env_1 = require("../config/env");
const DEFAULT_CHROME_PATH = (0, node_os_1.platform)() === "darwin"
    ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    : undefined;
const LOGIN_WAIT_MS = 120_000;
let client = null;
let isReady = false;
let qrAwaitingScan = false;
let inFlightLogin = null;
function isWhatsAppReady() {
    return isReady;
}
function getWhatsAppClient() {
    if (!client) {
        throw new Error("WhatsApp client was not initialized");
    }
    return client;
}
async function destroyWhatsAppClient() {
    if (!client) {
        isReady = false;
        qrAwaitingScan = false;
        return;
    }
    try {
        await client.destroy();
    }
    catch {
        // ignore
    }
    client = null;
    isReady = false;
    qrAwaitingScan = false;
}
async function requestWhatsAppLogin(options) {
    const force = options?.force === true;
    if (force && inFlightLogin) {
        return {
            success: false,
            code: "busy",
            message: "A login flow is already running. Wait for it to finish, then retry with force if needed.",
        };
    }
    if (force) {
        await destroyWhatsAppClient();
    }
    if (!env_1.env.whatsappEnabled) {
        return {
            success: false,
            code: "disabled",
            message: "WhatsApp is disabled. Set WHATSAPP_ENABLED=1 in .env and restart.",
        };
    }
    if (isReady && client) {
        return { success: true, authenticated: true };
    }
    if (inFlightLogin) {
        return inFlightLogin;
    }
    if (client && !isReady && qrAwaitingScan && !force) {
        return {
            success: false,
            code: "pending",
            message: 'A QR was already issued. Scan it with WhatsApp, or call POST /api/whatsapp/login with { "force": true } to generate a new QR.',
        };
    }
    inFlightLogin = runLoginFlow().finally(() => {
        inFlightLogin = null;
    });
    return inFlightLogin;
}
async function runLoginFlow() {
    await destroyWhatsAppClient();
    const executablePath = env_1.env.chromePath || DEFAULT_CHROME_PATH;
    const c = new whatsapp_web_js_1.Client({
        authStrategy: new whatsapp_web_js_1.LocalAuth(),
        puppeteer: {
            ...(executablePath ? { executablePath } : {}),
            headless: true,
            dumpio: false,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        },
    });
    client = c;
    return new Promise((resolve) => {
        let settled = false;
        const finish = (result) => {
            if (settled)
                return;
            settled = true;
            clearTimeout(timeout);
            resolve(result);
        };
        const timeout = setTimeout(() => {
            void (async () => {
                if (settled)
                    return;
                await destroyWhatsAppClient();
                finish({
                    success: false,
                    code: "timeout",
                    message: "Timed out waiting for QR or session. Check Chromium/CHROME_PATH on Linux and try again.",
                });
            })();
        }, LOGIN_WAIT_MS);
        c.on("ready", () => {
            isReady = true;
            qrAwaitingScan = false;
            if (!settled) {
                finish({ success: true, authenticated: true });
            }
        });
        c.on("qr", (qr) => {
            void (async () => {
                if (settled)
                    return;
                qrAwaitingScan = true;
                try {
                    const qrDataUrl = await qrcode_1.default.toDataURL(qr, {
                        errorCorrectionLevel: "M",
                        margin: 2,
                        width: 256,
                    });
                    finish({
                        success: true,
                        authenticated: false,
                        qr,
                        qrDataUrl,
                    });
                }
                catch (err) {
                    await destroyWhatsAppClient();
                    finish({
                        success: false,
                        code: "error",
                        message: err instanceof Error ? err.message : String(err),
                    });
                }
            })();
        });
        c.on("auth_failure", (msg) => {
            void destroyWhatsAppClient().then(() => {
                if (!settled) {
                    finish({
                        success: false,
                        code: "error",
                        message: `Auth failure: ${String(msg)}`,
                    });
                }
            });
        });
        c.on("disconnected", (reason) => {
            isReady = false;
            qrAwaitingScan = false;
            process.stdout.write(`[whatsapp] Disconnected: ${String(reason)}\n`);
        });
        c.initialize().catch((err) => {
            if (!settled) {
                void destroyWhatsAppClient().then(() => finish({
                    success: false,
                    code: "error",
                    message: err instanceof Error ? err.message : String(err),
                }));
            }
        });
    });
}
async function shutdownWhatsAppClient() {
    await destroyWhatsAppClient();
}
//# sourceMappingURL=whatsapp.client.js.map