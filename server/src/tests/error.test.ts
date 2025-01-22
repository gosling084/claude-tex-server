import { prisma } from './setup';
import request from 'supertest';
import { app } from '../index';
import { v4 as uuidv4 } from 'uuid';

describe("API Error Handling", () => {

    describe("Conversation Endpoints", () => {
        it("should reject invalid conversation creation requests", async () => {
            // Try posting new conversation without a title
            const newConversationNoTitle = {
                message: "Test message no title"
            };
            const noTitleResponse = await request(app)
                .post('/api/conversation')
                .set('Content-Type', 'application/json')
                .send(newConversationNoTitle)
                .expect(400);
            expect(noTitleResponse.body.message).toBe("Title and initial message are required");
            // Verify that the message was not added
            const messageNoTitle = await prisma.message.findFirst({
                where: {
                    content: "Test message no title"
                }
            });
            expect(messageNoTitle).toBeNull();

            // Try posting new conversation with no message
            const newConversationNoMessage = {
                title: "New Conversation, No Messages"
            };
            const noMessageResponse = await request(app)
                .post('/api/conversation')
                .set('Content-Type', 'application/json')
                .send(newConversationNoMessage)
                .expect(400);
            
            expect(noMessageResponse.body.message).toBe("Title and initial message are required");
            // Verify that the conversation was not added
            const conversationNoMessage = await prisma.conversation.findFirst({
                where: {
                    title: "New Conversation, No Messages"
                }
            });
            expect(conversationNoMessage).toBeNull();

            // Test with empty title and message
            const emptyFieldsConversation = {
                title: "",
                message: ""
            };
            await request(app)
                .post('/api/conversation')
                .set('Content-Type', 'application/json')
                .send(emptyFieldsConversation)
                .expect(400);
        });
        it("should handle malformed UUIDs", async () => {
            const badId: string = "This is a malformed ID"; // Ids are generated server-side in uuidv4 format
            const badConversationResponse = await request(app)
                .get(`/api/conversation/${badId}`)
                .expect(404); // Should 404 after database returns null
            expect(badConversationResponse.body.message)
                .toBe("Conversation not found");

            // Also try to post a message to malformed ID
            await request(app)
                .post(`/api/conversation/${badId}/messages`)
                .send({ type: 'user', content: 'test' })
                .expect(404); // Same as above, should fail database check
        });
        it("should reject invalid message types", async () => {
            // Start by creating new conversation with valid messages
            const newConversation = {
                title: "New Test Conversation",
                message: "Initial test message"
            };
        
            const response = await request(app)
                .post('/api/conversation')
                .set('Content-Type', 'application/json')
                .send(newConversation)
                .expect(201);

            const conversationId: string = response.body.id;
            const invalidTypes = ['BadType', 123, true, ['user', 'assistant']];
            for (const type of invalidTypes) {
                const invalidTypeResponse = await request(app)
                    .post(`/api/conversation/${conversationId}/messages`)
                    .send({ type, content: "Test message" })
                    .expect(400);
                expect(invalidTypeResponse.body.message).toBe("Invalid data provided");
            }
            const falsyTypes = ["", null, undefined, 0];
            for (const type of falsyTypes) {
                const invalidTypeResponse = await request(app)
                    .post(`/api/conversation/${conversationId}/messages`)
                    .send({ type, content: "Test message" })
                    .expect(400);
                expect(invalidTypeResponse.body.message).toBe("Content and type are required");
            }

            // Check that the database did not save the message
            const badMessageRecord = await prisma.message.findFirst({
                where: { content: "Test message" }
            });
            expect(badMessageRecord).toBeNull();
        });
    });

    describe("Message Endpoints", () => {
        it("should reject messages with empty content", async () => {
            // Start by creating new conversation with valid messages
            const newConversation = {
                title: "New Test Conversation",
                message: "Initial test message"
            };
        
            const response = await request(app)
                .post('/api/conversation')
                .set('Content-Type', 'application/json')
                .send(newConversation)
                .expect(201);

            const conversationId: string = response.body.id;

            // Try to send empty message
            const emptyMessageResponse = await request(app)
                .post(`/api/conversation/${conversationId}/messages`)
                .send({ type: 'user', content: "" })
                .expect(400);
            expect(emptyMessageResponse.body.message)
                .toBe('Content and type are required');
        });
        it("should reject messages to nonexistent conversations", async () => {
            // Generate conversationId not in the database
            const nonexistentId = uuidv4();
            // Verify the ID is not in the database
            await request(app)
                .get(`/api/conversation/${nonexistentId}`)
                .expect(404);
            const conversationCheck = await prisma.conversation.findUnique({
                where: {id: nonexistentId}
            });
            expect(conversationCheck).toBeNull();
            // Try to send message to nonexistent conversation
            const messageResponse = await request(app)
                .post(`/api/conversation/${nonexistentId}/messages`)
                .send({ type: 'user', content: "Message to nonexistent conversation" })
                .expect(404);
            expect(messageResponse.body.message)
                .toBe('Conversation not found');
            
        });
    });
});