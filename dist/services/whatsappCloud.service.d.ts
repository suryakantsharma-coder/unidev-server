export interface SendTextInput {
    to: string;
    text: string;
}
export interface SendTemplateInput {
    to: string;
    templateName: string;
    languageCode?: string;
    components?: unknown[];
}
export interface SendMediaInput {
    to: string;
    type: 'image' | 'document' | 'audio' | 'video';
    mediaUrl: string;
    caption?: string;
    filename?: string;
}
export interface WaSendResult {
    waMessageId: string;
    status: string;
}
export declare function sendTextMessage(input: SendTextInput): Promise<WaSendResult>;
export declare function sendTemplateMessage(input: SendTemplateInput): Promise<WaSendResult>;
export declare function sendMediaMessage(input: SendMediaInput): Promise<WaSendResult>;
export declare function markMessageRead(waMessageId: string): Promise<void>;
//# sourceMappingURL=whatsappCloud.service.d.ts.map