// server/src/middleware/rateLimit.ts
import { RateLimitRequestHandler, rateLimit } from 'express-rate-limit';

export const apiLimiter: RateLimitRequestHandler = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 60, // limit each IP to 60 requests per windowMs, or 4 per minute
    message: {
        status: 'error',
        message: "Too many request, please try again later"
    }
});