import { Conversation, Message } from '../types/conversation';
import { prisma } from './setup';
import { Prisma } from '@prisma/client';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from "uuid"

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Before all tests
beforeAll(async () => {
    // Connect to test database
    await prisma.$connect();
});

// After all tests
afterAll(async () => {
    // Clean up database
    await prisma.$disconnect();
});

// Before each test
beforeEach(async () => {
    // Clean up tables
    await prisma.message.deleteMany();
    await prisma.conversation.deleteMany();
});

describe("Transaction test", () => {
    it("should create a new conversation with user and assistant message", async () => {
        // Create new conversation
        const conversationId: string = uuidv4();
        const newConversation: Conversation = {
            id: conversationId,
            title: "New Conversation",
            createdAt: new Date(),
            updatedAt: new Date(),
            messages: []
        };

        // Add user message
        const userMessage: Message = {
            id: uuidv4(),
            conversationId: conversationId,
            content: "hello test world!",
            type: 'user',
            timestamp: new Date()
        };
        // Add assistant message
        const assistantMessage: Message = {
            id: uuidv4(),
            conversationId: conversationId,
            content: "hello test user!",
            type: 'assistant',
            timestamp: new Date()
        };
        // Create conversation and messages in a transaction
        await prisma.$transaction(async (tx) => {
            // Create new conversation
            await tx.conversation.create({
                data: {
                    id: newConversation.id,
                    title: newConversation.title,
                }
            });
            // Create messages
            await tx.message.create({
                data: userMessage
            });
            await tx.message.create({
                data: assistantMessage
            });
            // Update conversation timestamps
            await tx.conversation.update({
                where: { id: conversationId},
                data: {
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            });
        });

        // Recalling the conversation for our test cases
        const result: Conversation | null = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { messages: true }
        });

        // Verify conversation exists
        expect(result).toBeTruthy();
        // Verify conversation title
        expect(result?.title).toBe("New Conversation");
        // Verify message count
        expect(result?.messages).toHaveLength(2);
        // Verify message content
        expect(result?.messages).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    content: "hello test world!",
                    type: "user"
                }),
                expect.objectContaining({
                    content: "hello test user!",
                    type: "assistant"
                })
            ])
        );
    });
    it("should reject message with nonexistent conversation id", async () => {
        // Create new conversation
        const conversationId: string = uuidv4();
        const newConversation: Conversation = {
            id: conversationId,
            title: "New Conversation",
            createdAt: new Date(),
            updatedAt: new Date(),
            messages: []
        };

        // Phony conversation ID
        const fakeConversationId: string = uuidv4();

        // Add user message
        const userMessage: Message = {
            id: uuidv4(),
            conversationId: conversationId,
            content: "hello test world!",
            type: 'user',
            timestamp: new Date()
        };
        // Add bad message from assistant - fakeConversationId
        const assistantMessage: Message = {
            id: uuidv4(),
            conversationId: fakeConversationId, // This will cause the transaction to fail
            content: "hello test user!",
            type: 'assistant',
            timestamp: new Date()
        };
        try {
            // Create conversation and messages in a transaction
            await prisma.$transaction(async (tx) => {
                // Create new conversation
                await tx.conversation.create({
                    data: {
                        id: newConversation.id,
                        title: newConversation.title,
                    }
                });
                // Create messages
                await tx.message.create({
                    data: userMessage
                });
                await tx.message.create({
                    data: assistantMessage // This message contains the bad conversationId
                });
                // Update conversation timestamps
                await tx.conversation.update({
                    where: { id: conversationId},
                    data: {
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }
                });
            });
            // If we get here, test should fail
            fail('Transaction should have thrown an error');
        } catch (error) {
            // Verify no conversation was created
            const savedConversation = await prisma.conversation.findUnique({
                where: { id: conversationId },
                include: { messages: true }
            });
            expect(savedConversation).toBeNull();
            
            // Verify error is the right type
            expect(error).toBeInstanceOf(Prisma.PrismaClientKnownRequestError);
            expect((error as Prisma.PrismaClientKnownRequestError).code).toBe('P2003');
        }
    });
    it("should update the conversation timestamp", async () => {
        // Create new conversation with no messages and updatedAt timestamp
        const conversationId: string = uuidv4();
        const initialTimestamp: Date = await prisma.conversation.create({
            data: {
                id: conversationId,
                title: "New Conversation",
                createdAt: new Date(),
                updatedAt: new Date()
            }
        }).then(conv => conv.updatedAt);

        // Wait to ensure clear timestamp difference
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Add user message
        const userMessage: Message = {
            id: uuidv4(),
            conversationId: conversationId,
            content: "hello test world!",
            type: 'user',
            timestamp: new Date()
        };

        // Create transaction to add messages and return updated timestamp
        await prisma.$transaction(async (tx) => {
            // Create messages
            await tx.message.create({
                data: userMessage
            });
            // Update conversation timestamps
            await tx.conversation.update({
                where: { id: conversationId },
                data: { updatedAt: new Date() }
            });
        });

        // Recalling the conversation for our test cases
        const result: Conversation | null = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { messages: true }
        });

        // Fetch the updated timestamp
        const updatedTimestamp = result?.updatedAt;
        
        // Verify updatedAt timestamp is defined
        expect(updatedTimestamp).toBeTruthy();
        // Verify that updated timestamp is later than initial timestamp
        expect(updatedTimestamp?.getTime()).toBeGreaterThan(initialTimestamp.getTime());
        // Verify minimum time difference
        if (updatedTimestamp) expect(updatedTimestamp.getTime() - initialTimestamp.getTime()).toBeGreaterThanOrEqual(1000);
    });
    it("should maintain database state after failed transaction", async () => {
        const conversationId = uuidv4();
        const fakeConversationId = uuidv4();  // Will lead to transaction failure
    
        // Record initial state
        const conversationsBefore = await prisma.conversation.count();
        const messagesBefore = await prisma.message.count();
    
        try {
            await prisma.$transaction(async (tx) => {
                // Create new conversation
                await tx.conversation.create({
                    data: {
                        id: conversationId,
                        title: "New Conversation",
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }
                });
    
                // Try to create a message with wrong conversationId
                await tx.message.create({
                    data: {
                        id: uuidv4(),
                        conversationId: fakeConversationId,  // This should cause failure
                        content: "This should fail",
                        type: 'user',
                        timestamp: new Date()
                    }
                });
            });
            fail('Transaction should have failed');
        } catch (error) {
            // Verify no conversation was created
            const conversation = await prisma.conversation.findUnique({
                where: { id: conversationId }
            });
            expect(conversation).toBeNull();
    
            // Verify total counts unchanged
            const conversationsAfter = await prisma.conversation.count();
            const messagesAfter = await prisma.message.count();
            expect(conversationsAfter).toBe(conversationsBefore);
            expect(messagesAfter).toBe(messagesBefore);
        }
    });
    it("should handle transaction conflicts", async () => {
        // Creating conversations with the same ID
        const conversationId1 = uuidv4();
        const conversation1 = prisma.$transaction(async (tx) => {
            await tx.conversation.create({
                data: {
                    id: conversationId1, // Same conversationId
                    title: "Conversation 1",
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            });
        });

        const conversation2 = prisma.$transaction(async (tx) => {
            await tx.conversation.create({
                data: {
                    id: conversationId1, // Same conversationId
                    title: "Conversation 2",
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            });
        });

        // Error code should be P2002 for unique constraint violation
        await expect(Promise.all([conversation1, conversation2]))
            .rejects.toMatchObject({
                name: 'PrismaClientKnownRequestError',
                code: 'P2002',
            });

        // After the conflict test
        const savedConversation = await prisma.conversation.findUnique({
            where: { id: conversationId1 }
        });
        expect(savedConversation).toBeDefined();
        // One of the titles should have succeeded
        expect(['Conversation 1', 'Conversation 2']).toContain(savedConversation?.title);

        // Creating messages with the same ID
        const messageId = uuidv4();
        const conversationId2 = uuidv4();
        // Create initial conversation
        await prisma.conversation.create({
            data: {
                id: conversationId2,
                title: "Conflict Test",
                createdAt: new Date(),
                updatedAt: new Date()
            }
        });
    
        // Try to create two messages with the same ID
        const message1 = prisma.$transaction(async (tx) => {
            await tx.message.create({
                data: {
                    id: messageId,  // Same ID
                    conversationId: conversationId2,
                    content: "Message 1",
                    type: 'user',
                    timestamp: new Date()
                }
            });
        });
    
        const message2 = prisma.$transaction(async (tx) => {
            await tx.message.create({
                data: {
                    id: messageId,  // Same ID
                    conversationId: conversationId2,
                    content: "Message 2",
                    type: 'user',
                    timestamp: new Date()
                }
            });
        });
    
        // One should succeed, one should fail
        await expect(Promise.all([message1, message2]))
            .rejects.toThrow();
    });
});