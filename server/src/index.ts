// server/src/index.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { claudeRouter } from './routes/claude';
import { conversationRouter } from './routes/conversation'

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Routes
app.use('/api/claude', claudeRouter);
app.use('/api/conversation', conversationRouter)

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    status: 'error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});