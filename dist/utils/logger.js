"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logTest = logTest;
exports.logTestLine = logTestLine;
exports.logChatInput = logChatInput;
exports.logChatOutput = logChatOutput;
exports.logRealtimeInput = logRealtimeInput;
exports.logRealtimeOutput = logRealtimeOutput;
const env_1 = require("../config/env");
const prefix = '[chat]';
function enabled() {
    return env_1.env.logTestData;
}
/** Log request/response data for testing. Only logs when LOG_TEST_DATA=1 (or true/yes). */
function logTest(label, data) {
    if (!enabled())
        return;
    const payload = typeof data === 'object' && data !== null ? JSON.stringify(data, null, 2) : String(data);
    process.stdout.write(`${prefix} ${label} ${payload}\n`);
}
/** Log a single line for testing. */
function logTestLine(label, message) {
    if (!enabled())
        return;
    process.stdout.write(`${prefix} ${label} ${message}\n`);
}
/** Always log messages sent to the chatbot (input). */
function logChatInput(messages) {
    const payload = JSON.stringify(messages, null, 2);
    process.stdout.write(`${prefix} CHAT INPUT (sent to chatbot):\n${payload}\n`);
}
/** Always log response received from the chatbot (output). */
function logChatOutput(content) {
    process.stdout.write(`${prefix} CHAT OUTPUT (from chatbot):\n${content}\n`);
}
/** Always log realtime payload received from frontend. */
function logRealtimeInput(label, data) {
    const payload = typeof data === "object" && data !== null
        ? JSON.stringify(data, null, 2)
        : String(data);
    process.stdout.write(`${prefix} REALTIME INPUT (${label}):\n${payload}\n`);
}
/** Always log realtime payload sent back to frontend. */
function logRealtimeOutput(label, data) {
    const payload = typeof data === "object" && data !== null
        ? JSON.stringify(data, null, 2)
        : String(data);
    process.stdout.write(`${prefix} REALTIME OUTPUT (${label}):\n${payload}\n`);
}
//# sourceMappingURL=logger.js.map