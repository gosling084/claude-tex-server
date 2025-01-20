# Math Chat - Claude API Integration Project

A full-stack application that creates a mathematics-focused chat interface with the Claude API, featuring LaTeX rendering and conversation management. The application acts as an intelligent mathematics tutor, providing clear, LaTeX-formatted mathematical explanations.

## Project Structure

```
claude-tex-server/
├── client/               # React + TypeScript frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── services/    # API service layer
│   │   └── types/       # TypeScript definitions
│   └── .env.local       # Frontend environment variables
└── server/              # Express + TypeScript backend
    ├── src/
    │   ├── controllers/ # Request handlers
    │   ├── routes/      # API routes
    │   ├── types/       # TypeScript type definitions
    │   ├── tests/       # Jest test suite
    │   └── index.ts     # Server entry point
    ├── prisma/          # Database schema and migrations
    └── .env             # Backend environment variables
```

## Features

- LaTeX/MathJax rendering for mathematical expressions
- Conversation history management
- PostgreSQL database for data persistence
- Real-time message preview
- Responsive design
- Comprehensive test suite

## Prerequisites

- Node.js (v18 or higher recommended)
- PostgreSQL
- Anthropic API key (for production use)

## Setup Instructions

### Database Setup
1. Install PostgreSQL
2. Create database user and databases:
```bash
sudo -i -u postgres
createuser --interactive --pwprompt mathchat_dev
createdb mathchat
createdb mathchat_test  # For testing
psql
=# GRANT ALL PRIVILEGES ON DATABASE mathchat TO mathchat_dev;
=# GRANT ALL PRIVILEGES ON DATABASE mathchat_test TO mathchat_dev;
```

### Backend Setup
1. Navigate to server directory:
```bash
cd server
```
2. Install dependencies:
```bash
npm install
```
3. Create `.env` file:
```
PORT=3000
ANTHROPIC_API_KEY=your_api_key_here
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
DATABASE_URL="postgresql://mathchat_dev:your_password@localhost:5432/mathchat?schema=public"
```
4. Run database migrations:
```bash
npx prisma migrate dev
```
5. Start development server:
```bash
npm run dev
```

### Frontend Setup
1. Navigate to client directory:
```bash
cd client
```
2. Install dependencies:
```bash
npm install
```
3. Create `.env.local` file:
```
VITE_API_URL=http://localhost:3000/api
```
4. Start development server:
```bash
npm run dev
```

## Development

The development servers will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## Testing

Run the test suite from the server directory:
```bash
npm test
```

## API Endpoints

- `GET /api/conversations`: List all conversations
- `GET /api/conversation/:id`: Get specific conversation
- `POST /api/conversation`: Create new conversation
- `POST /api/conversation/:id/messages`: Add message to conversation