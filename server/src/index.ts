// server/src/index.ts
import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { claudeRouter } from './routes/claude';
import { conversationRouter } from './routes/conversation'
import { apiLimiter } from './middleware/rateLimit';

// Load environment variables
dotenv.config();

export const app: Express = express();
const port: string = process.env.PORT as string || String(3000);

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());
app.use('/api/', apiLimiter) // Apply to all API routes

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

// Only start server if this file is run directly (not imported for tests)
if (require.main === module) {
  app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
  });
}