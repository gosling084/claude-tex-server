// server/src/mocks/conversations.ts
import { Conversation } from '../types/conversation';

export const mockConversations: Conversation[] = [
  {
    id: '1',
    title: 'Quadratic Formula Discussion',
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T10:05:00Z'),
    messages: [
      {
        id: 'm1',
        conversationId: '1',
        content: 'What is the quadratic formula?',
        type: 'user',
        timestamp: new Date('2024-01-15T10:00:00Z')
      },
      {
        id: 'm2',
        conversationId: '1',
        content: 'The quadratic formula for solving $ax^2 + bx + c = 0$ is:\n\n\\[x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}\\]',
        type: 'assistant',
        timestamp: new Date('2024-01-15T10:05:00Z')
      }
    ]
  },
  {
    id: '2',
    title: 'Calculus Derivatives',
    createdAt: new Date('2024-01-16T14:00:00Z'),
    updatedAt: new Date('2024-01-16T14:10:00Z'),
    messages: [
      {
        id: 'm3',
        conversationId: '2',
        content: 'Can you explain the derivative of e^x?',
        type: 'user',
        timestamp: new Date('2024-01-16T14:00:00Z')
      },
      {
        id: 'm4',
        conversationId: '2',
        content: 'The derivative of $e^x$ is itself: $\\frac{d}{dx}e^x = e^x$\n\nThis is why $e^x$ is such a special function!',
        type: 'assistant',
        timestamp: new Date('2024-01-16T14:10:00Z')
      }
    ]
  }
];