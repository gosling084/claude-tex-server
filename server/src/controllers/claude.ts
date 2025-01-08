import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function processMessage(prompt: string) {
  try {
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });
    
    return response;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Claude API Error: ${error.message}`);
    }
    throw new Error('An unknown error occurred');
  }
}