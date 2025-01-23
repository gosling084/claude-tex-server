// server/src/types/conversation.ts
import { Message as AnthropicMessage } from "@anthropic-ai/sdk/resources";
export interface Conversation {
    id: string;
    title: string;
    createdAt: Date;
    updatedAt: Date;
    messages: Message[];
}

export interface Message {
    id: string;
    conversationId: string;
    content: string;
    type: 'user' | 'assistant';
    timestamp: Date;
}

// Could also add response types
export interface ConversationResponse {
    id: string;
    title: string;
    createdAt: string;  // ISO string for JSON
    updatedAt: string;
    messages: Message[];
}

export type PrismaConversation = {
    id: string;
    title: string;
    createdAt: Date;
    updatedAt: Date;
} | null;

export type ClaudeMessage = AnthropicMessage;