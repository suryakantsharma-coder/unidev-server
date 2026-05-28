# Chatbot Backend

Production-ready Node.js API for a ChatGPT-powered chatbot.

## Run instructions

### Prerequisites

- Node.js >= 18
- MongoDB
- OpenAI API key

### Setup

```bash
cp .env.example .env
# Edit .env and set MONGODB_URI and OPENAI_API_KEY
npm install
```

### Development

```bash
npm run dev
```

### Build and production

```bash
npm run build
npm start
```

Server listens on `PORT` (default `3000`). Endpoints:

- `POST /api/chat/input` — submit messages (body: `{ "messages": [{ "role": "user"|"assistant", "content": "string" }] }`).
- `POST /api/chat/output` — same body; response is SSE stream (`text/event-stream`) with `data: {"content":"..."}` chunks and `data: [DONE]` at end.
- `POST /api/realtime-voice/session` — creates an isolated OpenAI Realtime GA client secret for frontend WebRTC (body optional: `{ "instructions": "string", "voice": "alloy" }`).
- `POST /api/realtime-voice/calls` — backend-proxied GA signaling (body: `{ "sdp": "offer sdp string", "instructions?": "string", "voice?": "alloy" }`), returns `{ "answer_sdp": "..." }`.
- `POST /api/realtime-voice/lead` — sends voice-lead email to `hello@unidevsolution.in` with subject `voice agent leads` (body: `{ "name": "string", "email": "string", "projectSummary": "string", "company?": "string", "budget?": "string", "timeline?": "string" }`).
- `POST /api/realtime-voice/lead/test` — sends a test email to `hello@unidevsolution.in` with subject `voice agent leads`.
# unidev-server
