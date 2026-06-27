import { openai, OPENAI_MODEL } from '../config/openai';
import { randomBytes } from 'crypto';

export interface TaskPattern {
  title: string;
  completedAt: string;
  dayOfWeek: string;
  category: string;
  repeat: string;
}

export interface ReminderPattern {
  title: string;
  category: string;
  completedAt: string;
  snoozedCount: number;
  dayOfWeek: string;
}

export interface Stats {
  totalTasksThisWeek: number;
  completedTasksThisWeek: number;
  categoryBreakdown: Record<string, number>;
  mostProductiveDay: string;
  mostProductiveHour: number;
  avgCompletionRate: number;
}

export interface Patterns {
  tasks: TaskPattern[];
  reminders: ReminderPattern[];
  stats: Stats;
}

export interface SuggestionAction {
  type: 'schedule_task' | 'schedule_reminder' | 'none';
  title: string | null;
  suggestedDay: string | null;
  suggestedTime: string | null;
  category: 'health' | 'work' | 'personal' | null;
  repeat: 'one-time' | 'weekly' | null;
}

export interface Suggestion {
  id: string;
  type: 'pattern_repeat' | 'balance_nudge' | 'goal_suggestion';
  title: string;
  message: string;
  action: SuggestionAction;
}

const SYSTEM_PROMPT = `You are a personal life coach AI. Analyze this user's task and reminder patterns and return 3-5 smart suggestions.
Rules:
- If the same task title appears on the same day for 2+ weeks, suggest scheduling it again
- If work tasks exceed 70% of total, suggest a skill or health task
- If health category is empty this week, nudge toward it
- If reminders are frequently snoozed, suggest rescheduling them to a better time
- Be conversational, specific, and actionable
Return ONLY a JSON array, no markdown:
[
  {
    "id": "unique_string",
    "type": "pattern_repeat" | "balance_nudge" | "goal_suggestion",
    "title": "Short suggestion title",
    "message": "Conversational explanation (1-2 sentences)",
    "action": {
      "type": "schedule_task" | "schedule_reminder" | "none",
      "title": "Pre-filled task/reminder title",
      "suggestedDay": "Sunday" | null,
      "suggestedTime": "10:00" | null,
      "category": "health" | "work" | "personal" | null,
      "repeat": "one-time" | "weekly" | null
    }
  }
]`;

export async function analyzePatterns(patterns: Patterns): Promise<Suggestion[]> {
  const userMessage = `User patterns:\n${JSON.stringify(patterns, null, 2)}`;

  const response = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    temperature: 0.5,
    max_tokens: 1500,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userMessage },
    ],
  });

  const raw = response.choices[0]?.message?.content?.trim() ?? '[]';

  let parsed: Suggestion[];
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('AI returned invalid JSON');
  }

  // Ensure each suggestion has a unique id
  return parsed.map((s) => ({
    ...s,
    id: s.id || randomBytes(4).toString('hex'),
  }));
}
