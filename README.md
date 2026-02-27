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
# unidev-server
