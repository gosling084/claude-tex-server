// server/src/routes/claude.ts
import { Router, Request, Response, NextFunction } from 'express';
import { processMessage } from '../controllers/claude';

interface ChatRequest {
  prompt: string;
}

const router = Router();

router.post('/chat', 
  async function(
    req: Request<{}, any, ChatRequest>, 
    res: Response, 
    next: NextFunction
  ): Promise<void> {
    try {
      const { prompt } = req.body;
      
      if (!prompt || typeof prompt !== 'string') {
        res.status(400).json({
          status: 'error',
          message: 'Prompt is required and must be a string'
        });
        return;
      }

      const response = await processMessage(prompt);
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

export { router as claudeRouter};