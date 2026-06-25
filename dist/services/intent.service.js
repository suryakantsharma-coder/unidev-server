"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConversationContext = getConversationContext;
/**
 * Optional intent detection / preprocessing for messages.
 * Can be extended for routing or system prompt selection.
 */
function getConversationContext(messages) {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    return {
        lastUserMessage: lastUser?.content ?? null,
        messageCount: messages.length,
    };
}
//# sourceMappingURL=intent.service.js.map