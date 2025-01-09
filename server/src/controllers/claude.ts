import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MATH_SYSTEM_PROMPT = `You are a mathematics educator focusing on clear explanations. Present your mathematical answers with these strict requirements:

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

export async function processMessage(prompt: string) {
  try {
    const response = await anthropic.messages.create({
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
    
    return response;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Claude API Error: ${error.message}`);
    }
    throw new Error('An unknown error occurred');
  }
}