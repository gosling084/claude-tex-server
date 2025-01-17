// server/src/mocks/responses.ts
import { Message } from '../types/conversation';

// Template responses that will be used to create actual Message objects
const mathResponses: { [key: string]: Omit<Message, 'id' | 'conversationId'> } = {
    'derivative': {
        content: 'The derivative of $f(x)$ is:\n\n\\[\n\\frac{d}{dx}f(x) = \\lim_{h \\to 0} \\frac{f(x + h) - f(x)}{h}\\]\n\nThis represents the instantaneous rate of change.',
        type: 'assistant',
        timestamp: new Date()
    },
    'quadratic': {
        content: 'For a quadratic equation $ax^2 + bx + c = 0$, the solution is:\n\n\\[x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}\\]',
        type: 'assistant',
        timestamp: new Date()
    },
    'default': {
        content: 'I understand you have a math question. Could you please provide more details about what you\'d like to learn?',
        type: 'assistant',
        timestamp: new Date()
    }
};

// Function to create a complete Message with proper IDs
export const getMockResponse = async (prompt: string, conversationId: string): Promise<Message> => {
    // Find matching response or use default
    const responseTemplate = Object.entries(mathResponses).find(
        ([keyword]) => prompt.toLowerCase().includes(keyword)
    )?.[1] || mathResponses.default;

    // Simulate API delay (optional)
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Create a new Message object with fresh timestamp and proper IDs
    const response: Message = {
        ...responseTemplate,
        id: crypto.randomUUID(), // or use uuid if preferred
        conversationId,
        timestamp: new Date() // Fresh timestamp
    };
    
    return response;
};