import { LeadData } from "../types/chat.types";
type EmailOptions = {
    to?: string;
    subject?: string;
};
export declare function sendLeadEmail(lead: LeadData, options?: {
    isTest?: boolean;
} & EmailOptions): Promise<void>;
/** Send a test lead email using the same flow as real leads (for "send test email" requests). */
export declare function sendTestLeadEmail(): Promise<void>;
/** Send voice-agent lead email to dedicated Unidev inbox. */
export declare function sendVoiceLeadEmail(lead: LeadData): Promise<void>;
/** Send a test voice-agent lead email to dedicated Unidev inbox. */
export declare function sendVoiceTestLeadEmail(): Promise<void>;
export {};
//# sourceMappingURL=email.service.d.ts.map