export type Role = 'user' | 'assistant' | 'system';

export interface Message {
    id: string;
    role: Role;
    content: string;
    timestamp: number;
}

export interface ChatSession {
    id: string;
    title: string;
    messages: Message[];
    createdAt: number;
    updatedAt?: number;
}

export interface ChatState {
    sessions: ChatSession[];
    currentSessionId: string | null;
    isStreaming: boolean;
    searchQuery: string;
}
