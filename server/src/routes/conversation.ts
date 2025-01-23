// server/src/routes/conversation.ts
import { Router, Request, Response, NextFunction } from 'express';
import { Conversation, Message, PrismaConversation } from '../types/conversation';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';
import { processMessage } from '../controllers/claude';

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
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            res.status(500).json({ 
                message: 'Database error', 
                code: error.code 
            });
        } else if (error instanceof Prisma.PrismaClientInitializationError) {
            res.status(503).json({ 
                message: 'Database connection error' 
            });
        } else {
            next(error);
        }
    }
});

// Get conversation by ID
router.get('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const conversation: PrismaConversation = await prisma.conversation.findUnique({
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
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            switch (error.code) {
                case 'P2023':  // Inconsistent column data
                    res.status(400).json({ 
                        message: 'Invalid conversation ID format' 
                    });
                    break;
                default:
                    res.status(500).json({ 
                        message: 'Database error', 
                        code: error.code 
                    });
            }
        } else if (error instanceof Prisma.PrismaClientInitializationError) {
            res.status(503).json({ 
                message: 'Database connection error' 
            });
        } else {
            next(error);
        }
    }
});

// Create new conversation
router.post('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { message } = req.body;
        
        if (!message) {
            res.status(400).json({ message: 'Title and initial message are required' });
            return;
        }

        const conversationId: string = uuidv4();
        // Create new conversation and add new messages in a single transaction
        const newConversation: PrismaConversation = await prisma.$transaction(async (tx) => {
            // Use prompt message to generate title using Claude API
            const titleResponse: string = await processMessage(
                `Generate a concise, descriptive title (max 5 words) for this math question: "${message}"`
              );
            const title: string = titleResponse.trim();
            
            // Get Claude response first (outside DB operations)
            const claudeResponse: string = await processMessage(message);

            // Create conversation
            await tx.conversation.create({
                data: {
                    id: conversationId,
                    title: title,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            });

            // Then create both messages
            await tx.message.createMany({
                data: [
                    {
                        id: uuidv4(),
                        conversationId,
                        content: message,
                        type: 'user',
                        timestamp: new Date()
                    },
                    {
                        id: uuidv4(),
                        conversationId,
                        content: claudeResponse,
                        type: 'assistant',
                        timestamp: new Date()
                    }
                ]
            });

            // Fetch new conversation from database
            return tx.conversation.findUnique({
                where: {
                    id: conversationId
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
            });
        });
        if (!newConversation) {
            res.status(404).json({ message: 'Conversation not found' });
            return;
        }
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
        const conversationId: string = req.params.id;

        if (!content || !type) {
            res.status(400).json({ message: 'Content and type are required' });
            return;
        }

        // Verify conversation exists
        const conversation: PrismaConversation = await prisma.conversation.findUnique({
            where: { id: conversationId }
        });

        if (!conversation) {
            res.status(404).json({ message: 'Conversation not found' });
            return;
        }

        // Create messages in a transaction
        const result: {
            userMessage: Message;
            assistantMessage: Message;
        } = await prisma.$transaction(async (tx) => {
            // Create user message
            const userMessage: Message = await tx.message.create({
                data: {
                    id: uuidv4(),
                    conversationId,
                    content,
                    type,
                    timestamp: new Date()
                }
            });

            // Generate and create assistant message
            const claudeResponse: string = await processMessage(content);
            const assistantMessage: Message = await tx.message.create({
                data: {
                    id: uuidv4(),
                    conversationId,
                    content: claudeResponse,
                    type: 'assistant',
                    timestamp: new Date()
                }
            });

            // Update conversation timestamp
            await tx.conversation.update({
                where: { id: conversationId },
                data: { updatedAt: new Date() }
            });

            return { userMessage, assistantMessage };
        });

        res.status(201).json(result.assistantMessage);
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