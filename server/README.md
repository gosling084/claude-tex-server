# Math Chat Server

Backend implementation for the Math Chat application, featuring PostgreSQL database, Prisma ORM, and comprehensive testing.

## Database Schema

### Conversation Model
```prisma
model Conversation {
  id        String   @id @default(uuid())
  title     String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  messages  Message[]
}
```

### Message Model
```prisma
model Message {
  id             String       @id @default(uuid())
  content        String
  type           MessageType
  timestamp      DateTime     @default(now())
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  conversationId String
}

enum MessageType {
  user
  assistant
}
```

## Testing

The test suite uses Jest and Supertest with a dedicated test database.

### Test Database Setup
Create `.env.test` in the server directory:
```
DATABASE_URL="postgresql://mathchat_dev:your_password@localhost:5432/mathchat_test?schema=public"
```

### Running Tests
```bash
npm test           # Run all tests
npm run test:watch # Run in watch mode
```

### Test Structure
- `tests/setup.ts`: Global test configuration
- `tests/transaction.test.ts`: Database transaction tests
- Additional test files for routes and controllers

## Error Handling

The server implements comprehensive error handling for:
- Database errors (Prisma errors)
- Validation errors
- Not found errors
- Server errors

Example error response:
```json
{
  "status": "error",
  "message": "Resource not found",
  "code": 404
}
```

## Transaction Management

Database operations are wrapped in transactions where appropriate:

```typescript
const result = await prisma.$transaction(async (tx) => {
  // Multiple database operations
  // All succeed or all fail
});
```

## API Documentation

### GET /api/conversations
List all conversations with their messages.

Response:
```json
[
  {
    "id": "uuid",
    "title": "Conversation Title",
    "createdAt": "timestamp",
    "updatedAt": "timestamp",
    "messages": [
      {
        "id": "uuid",
        "content": "message content",
        "type": "user|assistant",
        "timestamp": "timestamp"
      }
    ]
  }
]
```

### GET /api/conversation/:id
Get a specific conversation by ID.

Request:
```
GET /api/conversation/123e4567-e89b-12d3-a456-426614174000
```

Response:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Conversation Title",
  "createdAt": "2024-01-19T12:00:00.000Z",
  "updatedAt": "2024-01-19T12:00:00.000Z",
  "messages": [
    {
      "id": "789e4567-e89b-12d3-a456-426614174000",
      "content": "What is the quadratic formula?",
      "type": "user",
      "timestamp": "2024-01-19T12:00:00.000Z"
    },
    {
      "id": "456e4567-e89b-12d3-a456-426614174000",
      "content": "The quadratic formula for solving $ax^2 + bx + c = 0$ is:\n\n\\[x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}\\]",
      "type": "assistant",
      "timestamp": "2024-01-19T12:00:00.000Z"
    }
  ]
}
```

### POST /api/conversation
Create a new conversation.

Request:
```json
{
  "title": "Quadratic Formula Discussion",
  "message": "What is the quadratic formula?"
}
```

Response:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Quadratic Formula Discussion",
  "createdAt": "2024-01-19T12:00:00.000Z",
  "updatedAt": "2024-01-19T12:00:00.000Z",
  "messages": [
    {
      "id": "789e4567-e89b-12d3-a456-426614174000",
      "content": "What is the quadratic formula?",
      "type": "user",
      "timestamp": "2024-01-19T12:00:00.000Z"
    },
    {
      "id": "456e4567-e89b-12d3-a456-426614174000",
      "content": "The quadratic formula for solving $ax^2 + bx + c = 0$ is:\n\n\\[x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}\\]",
      "type": "assistant",
      "timestamp": "2024-01-19T12:00:00.000Z"
    }
  ]
}
```

### POST /api/conversation/:id/messages
Add a message to an existing conversation.

Request:
```json
{
  "content": "Can you explain how to use this formula?",
  "type": "user"
}
```

Response:
```json
{
  "id": "456e4567-e89b-12d3-a456-426614174000",
  "conversationId": "123e4567-e89b-12d3-a456-426614174000",
  "content": "Let's break down how to use the quadratic formula step by step...",
  "type": "assistant",
  "timestamp": "2024-01-19T12:00:00.000Z"
}
```

### Error Responses

#### 404 Not Found
```json
{
  "status": "error",
  "message": "Conversation not found"
}
```

#### 400 Bad Request
```json
{
  "status": "error",
  "message": "Content and type are required"
}
```

#### 500 Server Error
```json
{
  "status": "error",
  "message": "Internal server error"
}
```