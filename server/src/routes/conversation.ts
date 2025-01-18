// server/src/routes/conversation.ts
import { Router, Request, Response, NextFunction } from 'express';
import { Conversation, Message } from '../types/conversation';
import { mockConversations } from '../mocks/conversations';
import { v4 as uuidv4 } from 'uuid';  // We'll need to add this package
import { getMockResponse } from '../mocks/responses';
import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';

const router = Router();

// Get all conversations
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const conversations: Conversation[] = await prisma.conversation.findMany({
            select: {
                id: true,
                title: true,
                createdAt: true,
                updatedAt: true,
                messages: {
                    select: {
                        id: true,
                        content: true,
                        type: true,
                        timestamp: true,
                        conversationId: true
                    }
                }
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });
        res.json(conversations);
    } catch (error) {
        next(error);
    }
});

// Get conversation by ID
router.get('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const conversation: Conversation | null = await prisma.conversation.findUnique({
            where: {
                id: req.params.id
            },
            select: {
                id: true,
                title: true,
                createdAt: true,
                updatedAt: true,
                messages: {
                    select: {
                        id: true,
                        content: true,
                        type: true,
                        timestamp: true,
                        conversationId: true
                    }
                }
            }
        })
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
            title: title,
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

        // Add to conversations in database
        await prisma.conversation.create({
            data: {
                id: newConversation.id,
                title: title,
                createdAt: newConversation.createdAt,
                updatedAt: newConversation.updatedAt,
                messages: {
                    createMany: {
                        data: newConversation.messages.map(m => {
                            return {
                                id: m.id,
                                content: m.content,
                                type: m.type,
                                timestamp: m.timestamp,
                                conversationId: m.conversationId
                            }
                        })
                    }
                }
            }
        })
        res.status(201).json(newConversation);
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            switch (error.code) {
                case 'P2002':  // Unique constraint violation
                    res.status(409).json({ 
                        message: 'A conversation with this ID already exists' 
                    });
                    break;
                case 'P2003':  // Foreign key constraint violation
                    res.status(400).json({ 
                        message: 'Invalid reference to related data' 
                    });
                    break;
                default:
                    res.status(500).json({ 
                        message: 'Database error', 
                        code: error.code 
                    });
            }
        } else if (error instanceof Prisma.PrismaClientValidationError) {
            res.status(400).json({ 
                message: 'Invalid data provided' 
            });
        } else if (error instanceof Prisma.PrismaClientInitializationError) {
            res.status(503).json({ 
                message: 'Database connection error' 
            });
        } else {
            next(error); // Pass other errors to express error handler
        }
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

        // Verify conversation exists
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId }
        });

        if (!conversation) {
            res.status(404).json({ message: 'Conversation not found' });
            return;
        }

        // Then proceed with message creation
        const userMessage: Message = {
            id: uuidv4(),
            conversationId: conversationId,
            content: content,
            type: type,
            timestamp: new Date()
        };

        // Generate mock assistant message
        const assistantMessage = await getMockResponse(content, conversationId);
        
        // Add user message and assistant message to database
        await prisma.message.createMany({
            data: [userMessage, assistantMessage]
        })

        res.status(201).json(assistantMessage);
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            switch (error.code) {
                case 'P2003':  // Foreign key constraint violation
                    res.status(400).json({ 
                        message: 'Invalid reference to related data' 
                    });
                    break;
                default:
                    res.status(500).json({ 
                        message: 'Database error', 
                        code: error.code 
                    });
            }
        } else if (error instanceof Prisma.PrismaClientValidationError) {
            res.status(400).json({ 
                message: 'Invalid data provided' 
            });
        } else if (error instanceof Prisma.PrismaClientInitializationError) {
            res.status(503).json({ 
                message: 'Database connection error' 
            });
        } else {
            next(error); // Pass other errors to express error handler
        }
    }
});

export { router as conversationRouter };