import { openai } from '../config/openai';

export type ActionType =
  | 'CREATE_TASK'
  | 'CREATE_REMINDER'
  | 'CREATE_SHOPPING_LIST'
  | 'ADD_SHOPPING_ITEM'
  | 'UPDATE_TASK'
  | 'DELETE_TASK'
  | 'NONE';

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

const SYSTEM_PROMPT = `You are an intelligent personal assistant built into a task and reminder management app.
Your job is to help the user manage their tasks, reminders, and shopping lists through natural conversation.

You can perform these actions by returning them in the "actions" array:

1. CREATE_TASK
   payload: { title, description, date (YYYY-MM-DD), time (HH:mm), priority (low|medium|high), repeat (one-time|daily|weekdays|weekends|weekly|monthly) }

2. CREATE_REMINDER
   payload: { title, description, date (YYYY-MM-DD), time (HH:mm), category (health|work|personal|finance|family|other), priority (low|medium|high) }

3. CREATE_SHOPPING_LIST
   payload: { name, items: [{name, quantity}] }

4. ADD_SHOPPING_ITEM
   payload: { listName, item: {name, quantity} }

5. UPDATE_TASK
   payload: { title, newDate, newTime, newPriority }

6. DELETE_TASK
   payload: { title }

7. NONE
   payload: {}

Rules:
- Always reply conversationally first, then include actions
- If the user says "remind me to buy groceries every Sunday at 10am" → CREATE_REMINDER with repeat weekly and day logic
- If the user says "add milk and eggs to my shopping list" → CREATE_SHOPPING_LIST or ADD_SHOPPING_ITEM
- If the user says "schedule a workout every weekday at 7am" → CREATE_TASK with repeat weekdays
- If date is relative ("tomorrow", "next Monday", "this weekend") → resolve to actual YYYY-MM-DD based on today's date
- If time is relative ("morning" = 08:00, "afternoon" = 14:00, "evening" = 19:00, "night" = 21:00)
- If something is unclear, ask a follow-up question and return NONE action
- Keep replies short, friendly and confirmatory
- Today's date is: {INJECT_TODAY_DATE}
- Current time is: {INJECT_CURRENT_TIME}

Always respond with valid JSON in this exact shape:
{
  "reply": "conversational response string",
  "actions": [{ "type": "ACTION_TYPE", "payload": {} }]
}`;

export async function aiChat(
  message: string,
  conversationHistory: ConversationMessage[],
): Promise<AiChatResult> {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const time  = now.toTimeString().slice(0, 5);

  const systemContent = SYSTEM_PROMPT
    .replace('{INJECT_TODAY_DATE}', today)
    .replace('{INJECT_CURRENT_TIME}', time);

  const messages = [
    { role: 'system' as const, content: systemContent },
    ...conversationHistory,
    { role: 'user' as const, content: message },
  ];

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages,
    response_format: { type: 'json_object' },
  });

  const raw = completion.choices[0]?.message?.content ?? '{}';

  let parsed: AiChatResult;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('AI returned invalid JSON');
  }

  return {
    reply:   parsed.reply   ?? '',
    actions: Array.isArray(parsed.actions) ? parsed.actions : [],
  };
}
