import { platform } from "node:os";
import qrcode from "qrcode-terminal";
import { Client, LocalAuth } from "whatsapp-web.js";
import { env } from "../config/env";

const DEFAULT_CHROME_PATH =
  platform() === "darwin"
    ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    : undefined;

let client: Client | null = null;
let isReady = false;

export function isWhatsAppReady(): boolean {
  return isReady;
}

export function getWhatsAppClient(): Client {
  if (!client) {
    throw new Error("WhatsApp client was not initialized");
  }
  return client;
}

export function initializeWhatsAppClient(): void {
  if (!env.whatsappEnabled) {
    process.stdout.write(
      "[whatsapp] Skipped — set WHATSAPP_ENABLED=1 in .env to enable\n",
    );
    return;
  }

  const executablePath = env.chromePath || DEFAULT_CHROME_PATH;

  client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      ...(executablePath ? { executablePath } : {}),
      headless: true,
      dumpio: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
    },
  });

  client.on("qr", (qr) => {
    process.stdout.write("[whatsapp] Scan this QR with WhatsApp:\n");
    qrcode.generate(qr, { small: true });
  });

  client.on("ready", () => {
    isReady = true;
    process.stdout.write("[whatsapp] Client ready\n");
  });

  client.on("auth_failure", (msg) => {
    process.stderr.write(`[whatsapp] Auth failure: ${String(msg)}\n`);
  });

  client.on("disconnected", (reason) => {
    isReady = false;
    process.stdout.write(`[whatsapp] Disconnected: ${String(reason)}\n`);
  });

  client.initialize().catch((err) => {
    process.stderr.write(
      `[whatsapp] Initialize failed: ${err instanceof Error ? err.message : String(err)}\n`,
    );
  });
}
