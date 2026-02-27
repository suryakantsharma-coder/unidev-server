# Cursor prompt: Chatbot UI with clean separation (hooks + context, UI presentational)

Use this prompt to build a frontend that consumes the chatbot backend. **Keep the UI layer purely presentational; put all logic and API calls in custom hooks (and optional context).**

---

## Backend API contract

**Base URL:** From env (e.g. `VITE_API_URL` or `NEXT_PUBLIC_API_URL`), default `http://localhost:4000`.

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/chat/input` | POST | Submit messages (optional persistence). Returns JSON. |
| `/api/chat/output` | POST | Get AI reply as **streaming SSE**. Same body as input. |

**Request body (both endpoints):**
```json
{
  "messages": [
    { "role": "user", "content": "Hello" },
    { "role": "assistant", "content": "Hi! How can I help?" },
    { "role": "user", "content": "Tell me more" }
  ]
}
```
- `messages`: non-empty array; each item: `role` (`"user"` | `"assistant"`), `content` (string).
- Validation: 400 if invalid. Rate limit: 30 req/min → 429.

**Response – POST /api/chat/input**
- 200: `{ "success": true }`
- 400/429/5xx: `{ "success": false, "message": "string" }`

**Response – POST /api/chat/output**
- Content-Type: `text/event-stream` (SSE).
- Events (one per line, prefix `data: `):
  1. First: `data: {"started":true}` — stream started.
  2. Content: `data: {"content":"<chunk>"}` — append `content` to the assistant message.
  3. Error (optional): `data: {"error":"<message>"}` — show error, then stream ends.
  4. End: `data: [DONE]` — stream finished (literal string `[DONE]`).
- **Important:** This is POST with a body, so use `fetch()` + `response.body` (ReadableStream), not `EventSource`. Pass `AbortSignal` so the user can cancel (e.g. Stop button).

---

## Architecture requirements

### 1. Custom hooks – all logic and API calls here

- **`useChat` (or split into `useChatMessages` + `useChatStream`)**
  - Owns: `messages` array, `isStreaming`, `error`, `sendMessage(text)`, `stopStream()`.
  - `sendMessage`: append user message → call POST `/api/chat/output` with full `messages` (including the new one), read SSE, append chunks to the latest assistant message, set `isStreaming` false on `[DONE]` or error.
  - Use `AbortController` for the fetch; expose `stopStream()` that aborts so the UI can show a Stop button.
  - Optionally call POST `/api/chat/input` with the full conversation after stream completes (if you want to persist).
  - No JSX in hooks; only state, effects, and functions.

- **`useChatApi` (optional)**  
  - Wraps base URL and `fetch` for `/api/chat/input` and `/api/chat/output`. Returns functions like `submitInput(messages)`, `streamOutput(messages, onChunk, onDone, signal)`. Keeps API base URL and parsing (SSE, JSON errors) in one place.

- **Types**
  - Define `ChatMessage = { role: 'user' | 'assistant'; content: string }`, request/response and SSE payload types in a `types` file and import them in the hooks.

### 2. Context (optional, minimal)

- Use **only** for values that many components need and that rarely change, e.g.:
  - `apiBaseUrl` (from env).
  - Or a small `ChatConfigContext` with `apiBaseUrl` and maybe `onError(error)`.
- Do **not** put messages, streaming state, or send/stop logic in context; keep those in the chat hook and pass down as props or hook return value.

### 3. UI layer – presentational only

- **Chat page/screen**
  - Uses the chat hook: `const { messages, isStreaming, error, sendMessage, stopStream } = useChat();`
  - Renders: a message list, an input, Send and (when streaming) Stop. No `fetch`, no SSE parsing, no AbortController in components.

- **Components**
  - `MessageList`, `MessageBubble`, `ChatInput`, `StreamingIndicator`, etc. Receive **props only**: `messages`, `isStreaming`, `onSend`, `onStop`, `error`. No direct API calls, no business logic.

- **Structure example**
  ```
  src/
    hooks/
      useChat.ts       # messages, sendMessage, stopStream, isStreaming, error
      useChatApi.ts    # (optional) base URL + fetch/SSE helpers
    context/
      ApiContext.tsx   # (optional) apiBaseUrl
    components/
      ChatPage.tsx     # uses useChat(), passes props to children
      MessageList.tsx
      MessageBubble.tsx
      ChatInput.tsx
    types/
      chat.ts
  ```

### 4. SSE consumption (in the hook or useChatApi)

- `fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages }), signal })`
- Read `response.body` with `getReader()`, decode chunks, split by `\n\n` and then by `data: `. For each line starting with `data: `:
  - Parse JSON; if `started === true`, ignore or set “streaming started”.
  - If `content` is present, append to current assistant message.
  - If `error` is present, set error state and stop.
  - If raw line is `[DONE]`, finish and set `isStreaming` false.

### 5. UX and quality

- Show loading/streaming state (e.g. “Assistant is typing…” or cursor).
- On error (network, 4xx/5xx, or SSE `error`), show a clear message; allow retry.
- Disable Send (or input) while `isStreaming` to avoid double-send.
- Scroll to the latest message when new content arrives.
- Use TypeScript types for all API and SSE payloads.

### 6. Do not

- Put `fetch`, SSE parsing, or AbortController inside UI components.
- Put messages or streaming state in context (keep in hook).
- Use `EventSource` for `/api/chat/output` (it does not support POST + body).
- Hardcode API keys or secrets; use env for base URL only.

---

## Deliverables

- New folder: `chatbot-ui/` or `frontend/` at repo root.
- All chat logic and API calls in **custom hooks**; optional minimal **context** for API base URL.
- **UI components** only receive data and callbacks; no logic.
- Short README: install, set `VITE_API_URL` (or equivalent), run, and how the hooks vs UI split works.
