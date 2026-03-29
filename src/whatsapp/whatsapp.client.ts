import { platform } from "node:os";
import QRCode from "qrcode";
import { Client, LocalAuth } from "whatsapp-web.js";
import { env } from "../config/env";

const DEFAULT_CHROME_PATH =
  platform() === "darwin"
    ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    : undefined;

const LOGIN_WAIT_MS = 120_000;

let client: Client | null = null;
let isReady = false;
let qrAwaitingScan = false;
let inFlightLogin: Promise<WhatsAppLoginResult> | null = null;

export type WhatsAppLoginResult =
  | { success: true; authenticated: true }
  | {
      success: true;
      authenticated: false;
      qr: string;
      qrDataUrl: string;
    }
  | {
      success: false;
      code: "disabled" | "busy" | "pending" | "timeout" | "error";
      message: string;
    };

export function isWhatsAppReady(): boolean {
  return isReady;
}

export function getWhatsAppClient(): Client {
  if (!client) {
    throw new Error("WhatsApp client was not initialized");
  }
  return client;
}

async function destroyWhatsAppClient(): Promise<void> {
  if (!client) {
    isReady = false;
    qrAwaitingScan = false;
    return;
  }
  try {
    await client.destroy();
  } catch {
    // ignore
  }
  client = null;
  isReady = false;
  qrAwaitingScan = false;
}

export type WhatsAppLoginOptions = { force?: boolean };

export async function requestWhatsAppLogin(
  options?: WhatsAppLoginOptions,
): Promise<WhatsAppLoginResult> {
  const force = options?.force === true;

  if (force && inFlightLogin) {
    return {
      success: false,
      code: "busy",
      message:
        "A login flow is already running. Wait for it to finish, then retry with force if needed.",
    };
  }

  if (force) {
    await destroyWhatsAppClient();
  }

  if (!env.whatsappEnabled) {
    return {
      success: false,
      code: "disabled",
      message:
        "WhatsApp is disabled. Set WHATSAPP_ENABLED=1 in .env and restart.",
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
      message:
        'A QR was already issued. Scan it with WhatsApp, or call POST /api/whatsapp/login with { "force": true } to generate a new QR.',
    };
  }

  inFlightLogin = runLoginFlow().finally(() => {
    inFlightLogin = null;
  });

  return inFlightLogin;
}

async function runLoginFlow(): Promise<WhatsAppLoginResult> {
  await destroyWhatsAppClient();

  const executablePath = env.chromePath || DEFAULT_CHROME_PATH;

  const c = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      ...(executablePath ? { executablePath } : {}),
      headless: true,
      dumpio: false,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
  });

  client = c;

  return new Promise<WhatsAppLoginResult>((resolve) => {
    let settled = false;

    const finish = (result: WhatsAppLoginResult) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      resolve(result);
    };

    const timeout = setTimeout(() => {
      void (async () => {
        if (settled) return;
        await destroyWhatsAppClient();
        finish({
          success: false,
          code: "timeout",
          message:
            "Timed out waiting for QR or session. Check Chromium/CHROME_PATH on Linux and try again.",
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
        if (settled) return;
        qrAwaitingScan = true;
        try {
          const qrDataUrl = await QRCode.toDataURL(qr, {
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
        } catch (err) {
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
        void destroyWhatsAppClient().then(() =>
          finish({
            success: false,
            code: "error",
            message: err instanceof Error ? err.message : String(err),
          }),
        );
      }
    });
  });
}

export async function shutdownWhatsAppClient(): Promise<void> {
  await destroyWhatsAppClient();
}
