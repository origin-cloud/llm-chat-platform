import { defineStore } from 'pinia';
import type { ChatState, ChatSession, Message, Role } from '../types/chat';

export const useChatStore = defineStore('chat', {
    state: (): ChatState => ({
        sessions: [],
        currentSessionId: null,
        isStreaming: false,
        searchQuery: '',
    }),
    persist: true,

    getters: {
        currentSession: (state) => {
            return state.sessions.find(s => s.id === state.currentSessionId);
        },
        filteredSessions: (state) => {
            if (!state.searchQuery) return state.sessions;
            const query = state.searchQuery.toLowerCase();
            return state.sessions.filter(s =>
                s.title.toLowerCase().includes(query) ||
                s.messages.some(m => m.content.toLowerCase().includes(query))
            );
        }
    },

    actions: {
        createSession() {
            const newSession: ChatSession = {
                id: crypto.randomUUID(),
                title: 'New Chat',
                messages: [],
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };
            this.sessions = [newSession, ...this.sessions];
            this.currentSessionId = newSession.id;
        },

        selectSession(id: string) {
            this.currentSessionId = id;
        },

        deleteSession(id: string) {
            const index = this.sessions.findIndex(s => s.id === id);
            if (index !== -1) {
                this.sessions.splice(index, 1);
                if (this.currentSessionId === id) {
                    this.currentSessionId = this.sessions[0]?.id || null;
                }
            }
        },

        clearAllSessions() {
            this.sessions = [];
            this.currentSessionId = null;
            this.createSession(); // Always keep one empty session
        },

        setSearchQuery(query: string) {
            this.searchQuery = query;
        },

        addMessage(role: Role, content: string) {
            if (!this.currentSessionId) return;

            const session = this.sessions.find(s => s.id === this.currentSessionId);
            if (session) {
                const newMessage: Message = {
                    id: crypto.randomUUID(),
                    role,
                    content,
                    timestamp: Date.now(),
                };
                session.messages.push(newMessage);
                session.updatedAt = Date.now();

                // Update title if it's the first user message
                if (role === 'user' && session.messages.length === 1) {
                    session.title = content.slice(0, 30) + (content.length > 30 ? '...' : '');
                }
            }
        },

        updateLastMessageContent(content: string) {
            if (!this.currentSessionId) return;

            const session = this.sessions.find(s => s.id === this.currentSessionId);
            if (session && session.messages.length > 0) {
                const lastMessage = session.messages[session.messages.length - 1];
                if (lastMessage) {
                    lastMessage.content = content;
                }
            }
        },

        setStreaming(isStreaming: boolean) {
            this.isStreaming = isStreaming;
        }
    },
});
