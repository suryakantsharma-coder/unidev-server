import OpenAI from "openai";
import { ChatMessagePayload } from "../types/chat.types";
export declare function acceptChatInput(messages: ChatMessagePayload[]): Promise<void>;
export declare function streamChatResponse(messages: ChatMessagePayload[], signal?: AbortSignal): Promise<AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>>;
export declare function saveAssistantMessage(content: string): Promise<void>;
//# sourceMappingURL=chat.service.d.ts.map