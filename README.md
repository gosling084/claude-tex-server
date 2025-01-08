# claude-tex-server

Full-stack application for interacting with Claude API and rendering LaTeX/MathJax in the browser.

## Structure
- `/client`: React + TypeScript frontend
- `/server`: Express + TypeScript backend

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn
- Git

### Server Setup
1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with your Anthropic API key:
   ```
   ANTHROPIC_API_KEY=your_api_key_here
   PORT=3000
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### Client Setup
1. Navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file:
   ```
   VITE_API_URL=http://localhost:3000/api
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Development
The development servers will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## Features
- Secure API calls to Claude API via backend proxy
- LaTeX/MathJax rendering in the browser
- TypeScript support for both frontend and backend
- React-based UI with modern development practices