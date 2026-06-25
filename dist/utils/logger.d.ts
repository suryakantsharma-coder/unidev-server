/** Log request/response data for testing. Only logs when LOG_TEST_DATA=1 (or true/yes). */
export declare function logTest(label: string, data: unknown): void;
/** Log a single line for testing. */
export declare function logTestLine(label: string, message: string): void;
/** Always log messages sent to the chatbot (input). */
export declare function logChatInput(messages: Array<{
    role: string;
    content: string;
}>): void;
/** Always log response received from the chatbot (output). */
export declare function logChatOutput(content: string): void;
/** Always log realtime payload received from frontend. */
export declare function logRealtimeInput(label: string, data: unknown): void;
/** Always log realtime payload sent back to frontend. */
export declare function logRealtimeOutput(label: string, data: unknown): void;
//# sourceMappingURL=logger.d.ts.map