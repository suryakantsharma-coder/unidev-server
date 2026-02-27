export type ChatRole = 'user' | 'assistant';

export interface ChatMessagePayload {
  role: ChatRole;
  content: string;
}

export interface ChatMessageDocument {
  role: ChatRole;
  content: string;
  createdAt: Date;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
}

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data?: T;
}

export interface LeadData {
  name: string;
  email: string;
  company?: string;
  budget?: string;
  timeline?: string;
  projectSummary: string;
}
