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
export declare function analyzePatterns(patterns: Patterns): Promise<Suggestion[]>;
//# sourceMappingURL=aiAnalyze.service.d.ts.map