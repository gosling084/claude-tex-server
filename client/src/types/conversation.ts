// client/src/types/conversation.ts

export interface Message {
    id: string;
    conversationId: string;
    content: string;
    type: 'user' | 'assistant';
    timestamp: Date;
}

export interface Conversation {
    id: string;
    title: string;
    createdAt: Date;
    updatedAt: Date;
    messages: Message[];
}