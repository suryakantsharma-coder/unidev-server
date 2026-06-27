"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzePatterns = analyzePatterns;
const openai_1 = require("../config/openai");
const crypto_1 = require("crypto");
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
async function analyzePatterns(patterns) {
    const userMessage = `User patterns:\n${JSON.stringify(patterns, null, 2)}`;
    const response = await openai_1.openai.chat.completions.create({
        model: openai_1.OPENAI_MODEL,
        temperature: 0.5,
        max_tokens: 1500,
        messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userMessage },
        ],
    });
    const raw = response.choices[0]?.message?.content?.trim() ?? '[]';
    let parsed;
    try {
        parsed = JSON.parse(raw);
    }
    catch {
        throw new Error('AI returned invalid JSON');
    }
    // Ensure each suggestion has a unique id
    return parsed.map((s) => ({
        ...s,
        id: s.id || (0, crypto_1.randomBytes)(4).toString('hex'),
    }));
}
//# sourceMappingURL=aiAnalyze.service.js.map