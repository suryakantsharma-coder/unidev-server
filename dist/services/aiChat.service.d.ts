export type ActionType = 'CREATE_TASK' | 'CREATE_REMINDER' | 'CREATE_SHOPPING_LIST' | 'ADD_SHOPPING_ITEM' | 'UPDATE_TASK' | 'DELETE_TASK' | 'NONE';
export interface Action {
    type: ActionType;
    payload: Record<string, unknown>;
}
export interface ConversationMessage {
    role: 'user' | 'assistant';
    content: string;
}
export interface AiChatResult {
    reply: string;
    actions: Action[];
}
export declare function aiChat(message: string, conversationHistory: ConversationMessage[]): Promise<AiChatResult>;
//# sourceMappingURL=aiChat.service.d.ts.map