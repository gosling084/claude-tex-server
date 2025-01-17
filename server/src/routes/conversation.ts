// server/src/routes/conversation.ts
import { Router, Request, Response, NextFunction } from 'express';
import { Conversation, Message } from '../types/conversation';
import { mockConversations } from '../mocks/conversations';
import { v4 as uuidv4 } from 'uuid';  // We'll need to add this package
import { getMockResponse } from '../mocks/responses';

const router = Router();

// Get all conversations
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        res.json(mockConversations);
    } catch (error) {
        next(error);
    }
});

// Get conversation by ID
router.get('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const conversation = mockConversations.find(c => c.id === req.params.id);
        if (!conversation) {
            res.status(404).json({ message: 'Conversation not found' });
            return;
        }
        res.json(conversation);
    } catch (error) {
        next(error);
    }
});

// Create new conversation
router.post('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { title, message } = req.body;
        
        if (!title || !message) {
            res.status(400).json({ message: 'Title and initial message are required' });
            return;
        }

        const conversationId: string = uuidv4();

        // Create initial conversation with user message
        const newConversation: Conversation = {
            id: conversationId,
            title,
            createdAt: new Date(),
            updatedAt: new Date(),
            messages: []
        };

        // Add user message
        const userMessage: Message = {
            id: uuidv4(),
            conversationId: conversationId,
            content: message,
            type: 'user',
            timestamp: new Date()
        };
        newConversation.messages.push(userMessage);

        // Generate and add assistant response
        const assistantMessage = await getMockResponse(message, conversationId);
        newConversation.messages.push(assistantMessage);

        // Add to mock conversations
        // In real implementation, would save to database
        mockConversations.push(newConversation);
        res.status(201).json(newConversation);
    } catch (error) {
        next(error);
    }
});

// Add message to conversation
router.post('/:id/messages', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { content, type } = req.body;
        const conversationId = req.params.id;

        if (!content || !type) {
            res.status(400).json({ message: 'Content and type are required' });
            return;
        }

        const conversation = mockConversations.find(c => c.id === conversationId);
        if (!conversation) {
            res.status(404).json({ message: 'Conversation not found' });
            return;
        }

        // Add user message to conversation (to be done in database later)
        conversation.messages.push(content)
        // Generate and return mock assistant message
        const assistantMessage = await getMockResponse(content, conversationId);
        conversation.messages.push(assistantMessage);
        conversation.updatedAt = new Date();

        res.status(201).json(assistantMessage);
    } catch (error) {
        next(error);
    }
});

export { router as conversationRouter };