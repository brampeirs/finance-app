export type MessageRole = 'system' | 'user' | 'assistant';

export interface ChatMessage {
  role: MessageRole;
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  stream?: boolean;
}

export interface ChatResponse {
  content: string;
  role: MessageRole;
}

export interface ChatError {
  message: string;
  status?: number;
}
