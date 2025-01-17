// client/src/types/api.ts
import Message from '@anthropic-ai/sdk';

export type ClaudeResponse = Message;

export interface ClaudeError {
  status: number;
  message: string;
}