import Message from '@anthropic-ai/sdk';
import { ClaudeError } from '../types/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const sendMessage = async (prompt: string): Promise<Message | ClaudeError> => {
  try {
    const response = await fetch(`${API_URL}/claude/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      return {
        status: 500,
        message: error.message,
      };
    }
    return {
      status: 500,
      message: 'An unknown error occurred',
    };
  }
};