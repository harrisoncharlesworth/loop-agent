export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  createdAt?: Date;
  toolCalls?: ToolCall[];
  toolInvocations?: ToolCall[]; // For compatibility with existing UI
  chatId?: string;
}

export interface Chat {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  preview?: string;
  messageCount: number;
}

export interface ChatWithMessages extends Chat {
  messages: Message[];
}

export interface CreateChatRequest {
  title?: string;
  firstMessage?: string;
}

export interface UpdateChatRequest {
  title?: string;
  preview?: string;
}

export interface MessageInput {
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: ToolCall[];
}

export interface ToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
  output: string;
  error?: string;
}

export interface Tool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties?: Record<string, unknown>;
    required?: string[];
    [key: string]: unknown;
  };
  handler: (input: Record<string, unknown>) => Promise<string>;
}
