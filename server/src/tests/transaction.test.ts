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
    it("should reject for nonexistent conversation", async () => {
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
    
});