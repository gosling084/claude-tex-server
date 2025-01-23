// server/src/controllers/claude.ts
import dotenv from 'dotenv';
dotenv.config();

import Anthropic from '@anthropic-ai/sdk';
import { CLAUDE_CONFIG } from '../config/claude';
import { ClaudeMessage } from '../types/conversation';

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY environment variable is not set');
}

const anthropic: Anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MATH_SYSTEM_PROMPT: string = `You are a mathematics educator focusing on clear explanations. Present your mathematical answers with these strict requirements:

Format:
- Use LaTeX for ALL mathematical expressions, no plain text math
- Use display math (\\[ ... \\]) for important equations or multi-line expressions
- Use inline math ($ ... $) for expressions within text
- Never use $$ or \\( \\) delimiters
- Use proper LaTeX commands for all mathematical symbols and operators
- For multi-line equations, use the gathered environment:
  \\[
  \\begin{gathered}
  first equation \\\\
  second equation \\\\
  third equation
  \\end{gathered}
  \\]

Structure:
1. Start with a brief, clear statement of the result
2. Show key steps, each with clear mathematical expressions
3. Include minimal explanation text only where needed for clarity
4. Never add unnecessary text, pleasantries, or decorative elements

Additional rules:
- Keep responses concise
- Include units in LaTeX math mode when relevant
- Use \\text{} for words within math environments`;

export async function processMessage(prompt: string, retryCount = 0): Promise<string> {
  try {
    const response: ClaudeMessage = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1024,
      system: MATH_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
            }
          ]
        },
      ],
    });
    
    const textContent = response.content.find(block => block.type === 'text')?.text;
    if (!textContent) {
      throw new Error('No text content in response');
    }
    
    return textContent;

  } catch (error) {
    if (retryCount < CLAUDE_CONFIG.retry_attempts) {
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, retryCount)));
      return processMessage(prompt, retryCount + 1);
    }
    
    console.error('Claude API Error:', error); // Add detailed logging
    if (error instanceof Anthropic.APIError) {
      throw new Error(`Claude API Error: ${error.message} (Status: ${error.status})`);
    }
    throw new Error(`Unknown error occurred: ${error instanceof Error ? error.message : 'No error message'}`);
  }
}