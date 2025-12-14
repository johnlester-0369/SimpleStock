import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express';
import { logger } from '@/utils/logger.js';
const app = express();

/**
 * Request logging middleware.
 * Logs HTTP method, URL, status code, and response time for each request.
 */
app.use((req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  // Log request details
  logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Capture response finish event
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logLevel = res.statusCode >= 400 ? 'warn' : 'info';

    logger.log(logLevel, 'Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });
  });

  next();
});

app.get('/', (_req: Request, res: Response) => {
  res.send('Welcome to express');
});

export default app;
