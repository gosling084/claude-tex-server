# claude-tex-server

A full-stack application that serves as a proxy for Claude API calls and renders LaTeX/MathJax in the browser.

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
    │   └── index.ts     # Server entry point
    └── .env             # Backend environment variables
```

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher recommended)
- npm
- Anthropic API key (for production use)

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
   ```
4. Start development server:
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

### API Endpoints

- `GET /health`: Health check endpoint
- `POST /api/claude/chat`: Proxy endpoint for Claude API
  - Request body: `{ "prompt": "string" }`
  - Returns: Claude API response or error object