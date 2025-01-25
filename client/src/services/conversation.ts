// client/src/services/conversation.ts
import { Conversation, Message } from '@/types/conversation';
import { ClaudeModel } from '@/types/config';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const getConversations = async (): Promise<Conversation[]> => {
  const response = await fetch(`${API_URL}/conversation`);
  if (!response.ok) {
    throw new Error('Failed to fetch conversations');
  }
  return response.json();
};

export const getConversation = async (id: string): Promise<Conversation> => {
  const response = await fetch(`${API_URL}/conversation/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch conversation');
  }
  return response.json();
};

export const createConversation = async (message: string, model: ClaudeModel): Promise<Conversation> => {
  const response = await fetch(`${API_URL}/conversation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, model }),
  });
  if (!response.ok) {
    throw new Error('Failed to create conversation');
  }
  return response.json();
};

export const addMessage = async (conversationId: string, content: string, type: 'user' | 'assistant', model: ClaudeModel): Promise<Message> => {
  const response = await fetch(`${API_URL}/conversation/${conversationId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content, type, model }),
  });
  if (!response.ok) {
    throw new Error('Failed to add message');
  }
  return response.json();
};