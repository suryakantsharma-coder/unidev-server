import { Client } from "whatsapp-web.js";
export type WhatsAppLoginResult = {
    success: true;
    authenticated: true;
} | {
    success: true;
    authenticated: false;
    qr: string;
    qrDataUrl: string;
} | {
    success: false;
    code: "disabled" | "busy" | "pending" | "timeout" | "error";
    message: string;
};
export declare function isWhatsAppReady(): boolean;
export declare function getWhatsAppClient(): Client;
export type WhatsAppLoginOptions = {
    force?: boolean;
};
export declare function requestWhatsAppLogin(options?: WhatsAppLoginOptions): Promise<WhatsAppLoginResult>;
export declare function shutdownWhatsAppClient(): Promise<void>;
//# sourceMappingURL=whatsapp.client.d.ts.map