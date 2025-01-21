import { prisma } from './setup';
import { v4 as uuidv4 } from 'uuid';
import request from 'supertest';
import { app } from '../index';

describe("Conversation Operations", () => {
    // Create sample conversation before tests
    beforeEach(async () => {
        const conversationId = uuidv4();
        await prisma.conversation.create({
            data: {
                id: conversationId,
                title: "Test Conversation",
                createdAt: new Date(),
                updatedAt: new Date(),
                messages: {
                    create: {
                        id: uuidv4(),
                        content: "Test message",
                        type: 'user',
                        timestamp: new Date()
                    }
                }
            }
        });
    });

    it("should retrieve all conversations", async () => {
        // Test GET /conversations
        const response = await request(app)
            .get('/api/conversation')
            .expect(200);
        
        // Now we need to verify:
        // 1. Response is an array
        expect(Array.isArray(response.body)).toBeTruthy();
        // 2. Contains our test conversation from beforeEach
        expect(response.body.length).toBeGreaterThan(0);
        // 3. Has correct shape
        expect(response.body[0]).toHaveProperty('id');
        expect(response.body[0]).toHaveProperty('title');
    });

    it("should retrieve a specific conversation by id", async () => {
        // Test GET /conversation/:id
        const conversation = await prisma.conversation.findFirst({
            where: { title: "Test Conversation" },
            include: { messages: true }
        });
    
        if (!conversation) {
            throw new Error('Test conversation not found');
        }
    
        const response = await request(app)
            .get(`/api/conversation/${conversation.id}`)
            .expect(200)
            .expect('Content-Type', /json/);
    
        // Verify conversation properties
        expect(response.body).toMatchObject({
            id: conversation.id,
            title: "Test Conversation",
            messages: expect.any(Array),
            createdAt: expect.any(String),
            updatedAt: expect.any(String)
        });
    
        // Verify message properties
        expect(response.body.messages).toHaveLength(1);
        expect(response.body.messages[0]).toMatchObject({
            content: "Test message",
            type: 'user',
            conversationId: conversation.id
        });
    });

    it("should create a new conversation", async () => {
        // Test POST /conversation
        const newConversation = {
            title: "New Test Conversation",
            message: "Initial test message"
        };
    
        const response = await request(app)
            .post('/api/conversation')
            .set('Content-Type', 'application/json')  // Set headers
            .send(newConversation)  // Send request body
            .expect(201);  // Expect Created status
        
        // Verify returned conversation's properties
        expect(response.body).toMatchObject({
            id: expect.any(String),
            title: "New Test Conversation",
            messages: expect.any(Array),
            createdAt: expect.any(String),
            updatedAt: expect.any(String)
        });

        // Verify both user and assistant messages exist
        expect(response.body.messages).toHaveLength(2);
        expect(response.body.messages).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    type: 'user',
                    content: "Initial test message"
                }),
                expect.objectContaining({
                    type: 'assistant'
                })
            ])
        );

        // Search conversation by ID
        const conversationId: string = response.body.id;
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId }
        });

        // Check for conversation existence
        expect(conversation).toBeTruthy(); // ie, not null
        // Verify conversation title
        expect(conversation?.title).toBe("New Test Conversation");
        // Validate timestamp format
        expect(conversation?.createdAt).toBeInstanceOf(Date);
        expect(conversation?.updatedAt).toBeInstanceOf(Date);


        // Search message by ID
        const messageId: string = response.body.messages[0].id;
        const message = await prisma.message.findUnique({
            where: { id: messageId }
        });

        // Check for message existence
        expect(message).toBeTruthy(); // ie, not null
        // Validate message type
        expect(message?.type).toBe('user');  // For the user message
        // Verify message has conversationId
        expect(message?.conversationId).toBe(conversationId);
        // Verify message content
        expect(message?.content).toBe("Initial test message");

        // Verify that the assistant message was added
        const savedConversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { messages: true }
        });
        expect(savedConversation?.messages).toHaveLength(2);  // Both user and assistant
    });

    it("should fail to retrieve non-existent conversation", async () => {
        // Test GET with invalid id
        // Generate new ID not in database
        const fakeConversationId: string = uuidv4();

        const response = await request(app)
            .get(`/api/conversation/${fakeConversationId}`)
            .expect(404)
            .expect('Content-Type', /json/);

    });

    it("should maintain conversation order by updated timestamp", async () => {
        // Test conversation ordering
    });
});