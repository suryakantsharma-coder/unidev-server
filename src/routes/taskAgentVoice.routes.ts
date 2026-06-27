import { Router } from 'express';
import { env } from '../config/env';

const router = Router();

// ─── System prompt ────────────────────────────────────────────────────────────

function buildSystemPrompt(): string {
  const now   = new Date();
  const today = now.toISOString().split('T')[0];
  const time  = now.toTimeString().slice(0, 5);

  return `You are an intelligent personal assistant built into a task and reminder management app.
Your job is to help the user manage their tasks, reminders, and shopping lists through natural voice conversation.

Today's date is: ${today}
Current time is: ${time}

Rules:
- Always reply conversationally and confirm what you did in 1-2 short sentences
- If date is relative ("tomorrow", "next Monday", "this weekend") resolve to an actual YYYY-MM-DD date
- If time is relative: morning = 08:00, afternoon = 14:00, evening = 19:00, night = 21:00
- If something is unclear, ask a single focused follow-up question
- Keep replies short and friendly — this is a voice interface, not a chat window
- After calling a tool, verbally confirm what was created/updated/deleted

You have access to these tools to take real actions in the app:
create_task, create_reminder, create_shopping_list, add_shopping_item, update_task, delete_task`;
}

// ─── Tool definitions (OpenAI function-calling schema) ───────────────────────

const TASK_AGENT_TOOLS = [
  {
    type: 'function',
    name: 'create_task',
    description: 'Create a new task for the user',
    parameters: {
      type: 'object',
      properties: {
        title:       { type: 'string',  description: 'Task title' },
        description: { type: 'string',  description: 'Optional details' },
        date:        { type: 'string',  description: 'Due date YYYY-MM-DD' },
        time:        { type: 'string',  description: 'Due time HH:mm' },
        priority:    { type: 'string',  enum: ['low', 'medium', 'high'] },
        repeat:      { type: 'string',  enum: ['one-time', 'daily', 'weekdays', 'weekends', 'weekly', 'monthly'] },
      },
      required: ['title'],
    },
  },
  {
    type: 'function',
    name: 'create_reminder',
    description: 'Create a new reminder for the user',
    parameters: {
      type: 'object',
      properties: {
        title:       { type: 'string', description: 'Reminder title' },
        description: { type: 'string', description: 'Optional details' },
        date:        { type: 'string', description: 'Date YYYY-MM-DD' },
        time:        { type: 'string', description: 'Time HH:mm' },
        category:    { type: 'string', enum: ['health', 'work', 'personal', 'finance', 'family', 'other'] },
        priority:    { type: 'string', enum: ['low', 'medium', 'high'] },
      },
      required: ['title'],
    },
  },
  {
    type: 'function',
    name: 'create_shopping_list',
    description: 'Create a new shopping list with items',
    parameters: {
      type: 'object',
      properties: {
        name:  { type: 'string', description: 'Shopping list name' },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name:     { type: 'string' },
              quantity: { type: 'string' },
            },
            required: ['name'],
          },
        },
      },
      required: ['name', 'items'],
    },
  },
  {
    type: 'function',
    name: 'add_shopping_item',
    description: 'Add a single item to an existing shopping list',
    parameters: {
      type: 'object',
      properties: {
        listName: { type: 'string', description: 'Name of the existing list' },
        item: {
          type: 'object',
          properties: {
            name:     { type: 'string' },
            quantity: { type: 'string' },
          },
          required: ['name'],
        },
      },
      required: ['listName', 'item'],
    },
  },
  {
    type: 'function',
    name: 'update_task',
    description: 'Update an existing task',
    parameters: {
      type: 'object',
      properties: {
        title:       { type: 'string', description: 'Title of the task to update' },
        newDate:     { type: 'string', description: 'New date YYYY-MM-DD' },
        newTime:     { type: 'string', description: 'New time HH:mm' },
        newPriority: { type: 'string', enum: ['low', 'medium', 'high'] },
      },
      required: ['title'],
    },
  },
  {
    type: 'function',
    name: 'delete_task',
    description: 'Delete a task by title',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Title of the task to delete' },
      },
      required: ['title'],
    },
  },
];

// ─── Helper ───────────────────────────────────────────────────────────────────

async function createTaskAgentSession(voice: string): Promise<{ ok: boolean; status: number; body: Record<string, unknown> }> {
  const inputTranscription = env.realtimeEnableInputTranscription
    ? { transcription: { model: env.REALTIME_INPUT_TRANSCRIPTION_MODEL } }
    : { transcription: null };

  const response = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      session: {
        type: 'realtime',
        model: env.REALTIME_MODEL,
        instructions: buildSystemPrompt(),
        output_modalities: ['audio'],
        audio: {
          input: inputTranscription,
          output: { voice },
        },
        tools: TASK_AGENT_TOOLS,
        tool_choice: 'auto',
      },
    }),
  });

  const body = (await response.json()) as Record<string, unknown>;
  return { ok: response.ok, status: response.status, body };
}

// ─── POST /api/task-agent-voice/session ───────────────────────────────────────

router.post('/session', async (req, res, next) => {
  try {
    const voice = typeof req.body?.voice === 'string' && req.body.voice.trim()
      ? req.body.voice.trim()
      : env.REALTIME_DEFAULT_VOICE;

    const { ok, status, body } = await createTaskAgentSession(voice);

    if (!ok) {
      res.status(status).json({ error: 'Failed to create task agent session', details: body });
      return;
    }

    // client_secrets endpoint returns key at top-level value + session.id
    const ephemeralKey = (body.value ?? (body.client_secret as Record<string, unknown>)?.value) as string | undefined;
    const expiresAt    = (body.expires_at ?? (body.client_secret as Record<string, unknown>)?.expires_at) as number | undefined;
    const sessionId    = ((body.session as Record<string, unknown>)?.id) as string | undefined;

    if (!ephemeralKey) {
      res.status(502).json({ error: 'OpenAI did not return an ephemeral key', details: body });
      return;
    }

    res.status(201).json({
      ephemeral_key: ephemeralKey,
      expires_at:    expiresAt,
      session_id:    sessionId,
      voice,
      // convenience alias so different RN SDKs can find the key
      client_secret: { value: ephemeralKey, expires_at: expiresAt },
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/task-agent-voice/calls ─────────────────────────────────────────
// React Native sends its WebRTC offer SDP here.
// Server gets an ephemeral key, then proxies the SDP to OpenAI and returns
// the answer SDP — same pattern as the working Unidev agent.

router.post('/calls', async (req, res, next) => {
  try {
    const sdp   = req.body?.sdp as string | undefined;
    const voice = typeof req.body?.voice === 'string' && req.body.voice.trim()
      ? req.body.voice.trim()
      : env.REALTIME_DEFAULT_VOICE;

    if (!sdp || sdp.trim().length === 0) {
      res.status(400).json({ error: 'Missing required field: sdp' });
      return;
    }

    // Step 1 — get an ephemeral key with the task-agent session config
    const { ok: sessionOk, status: sessionStatus, body: sessionBody } = await createTaskAgentSession(voice);
    if (!sessionOk) {
      res.status(sessionStatus).json({ error: 'Failed to create task agent session', details: sessionBody });
      return;
    }

    const ephemeralKey = (
      sessionBody.value ?? (sessionBody.client_secret as Record<string, unknown>)?.value
    ) as string | undefined;

    if (!ephemeralKey) {
      res.status(502).json({ error: 'OpenAI did not return an ephemeral key', details: sessionBody });
      return;
    }

    // Step 2 — proxy the WebRTC SDP offer to OpenAI
    const formData = new FormData();
    formData.append('sdp', sdp);

    const callResponse = await fetch('https://api.openai.com/v1/realtime/calls', {
      method: 'POST',
      headers: { Authorization: `Bearer ${ephemeralKey}` },
      body: formData,
    });

    const answerSdp = await callResponse.text();

    if (!callResponse.ok) {
      res.status(callResponse.status).json({ error: 'Failed to establish realtime call', details: answerSdp });
      return;
    }

    res.status(200).json({ answer_sdp: answerSdp });
  } catch (err) {
    next(err);
  }
});

export default router;
