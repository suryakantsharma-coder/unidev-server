"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SSE_DONE = void 0;
exports.setupSse = setupSse;
exports.sendSseInitial = sendSseInitial;
exports.sendSseChunk = sendSseChunk;
exports.sendSseDone = sendSseDone;
exports.isSseConnectionClosed = isSseConnectionClosed;
const SSE_HEADERS = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
};
function setupSse(res) {
    res.writeHead(200, SSE_HEADERS);
    res.flushHeaders();
}
/** Send an initial event so the client receives a response immediately (avoids “no response” until first token). */
function sendSseInitial(res) {
    res.write('data: {"started":true}\n\n');
    flushRes(res);
}
function flushRes(res) {
    const f = res.flush;
    if (typeof f === 'function')
        f.call(res);
}
function sendSseChunk(res, data) {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
    flushRes(res);
}
exports.SSE_DONE = { done: true };
function sendSseDone(res) {
    res.write('data: [DONE]\n\n');
}
function isSseConnectionClosed(res) {
    return res.writableEnded;
}
//# sourceMappingURL=sse.js.map