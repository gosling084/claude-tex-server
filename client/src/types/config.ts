// client/src/types/config.ts
import { Model } from "@anthropic-ai/sdk/resources/index.mjs";
export type ClaudeModel = Model;

export interface ModelConfig {
  id: ClaudeModel;
  name: string;
  description: string;
}

export const CLAUDE_MODELS: ModelConfig[] = [
  {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet',
    description: 'Most intelligent model'
  },
  {
    id: 'claude-3-5-haiku-20241022',
    name: 'Claude 3.5 Haiku',
    description: 'Fastest model for daily tasks'
  }
];