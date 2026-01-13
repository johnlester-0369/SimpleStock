/**
 * Express Application Configuration
 *
 * Sets up Express middleware and routes. The auth routes are mounted
 * dynamically after auth initialization.
 *
 * @module app
 */

import express, {
  type Express,
  type Request,
  type Response,
  type NextFunction,
} from 'express';
import { toNodeHandler } from 'better-auth/node';
import { logger } from '@/utils/logger.util.js';
import type { AuthInstance } from '@/lib/auth.lib.js';

// Import API routes
import productRoutes from '@/routes/v1/product.routes.js';
import supplierRoutes from '@/routes/v1/supplier.routes.js';
import transactionRoutes from '@/routes/v1/transaction.routes.js';

// ============================================================================
// APPLICATION FACTORY
// ============================================================================

/**
 * Creates and configures the Express application.
 * Auth routes are mounted after the auth instance is provided.
 *
 * @param auth - The initialized Better Auth instance
 * @returns Configured Express application
 *
 * @example
 * ```typescript
 * import { initializeAuth } from '@/lib/auth.lib.js';
 * import { createApp } from '@/app.js';
 *
 * const auth = await initializeAuth();
 * const app = createApp(auth);
 * app.listen(3000);
 * ```
 */
export function createApp(auth: AuthInstance): Express {
  const app = express();

  // ==========================================================================
  // MIDDLEWARE
  // ==========================================================================

  /**
   * JSON body parser middleware
   * Required for POST/PUT requests with JSON bodies
   */
  app.use(express.json());

  /**
   * URL-encoded body parser middleware
   * Required for form submissions
   */
  app.use(express.urlencoded({ extended: true }));

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

  // ==========================================================================
  // ROUTES
  // ==========================================================================

  /**
   * Better-Auth handler mount point.
   * All auth routes are handled by Better Auth.
   */
  app.all('/api/v1/user/auth/*', toNodeHandler(auth));

  /**
   * API v1 routes
   */
  app.use('/api/v1/user/products', productRoutes);
  app.use('/api/v1/user/suppliers', supplierRoutes);
  app.use('/api/v1/user/transactions', transactionRoutes);

  /**
   * Health check / root endpoint.
   */
  app.get('/', (_req: Request, res: Response) => {
    res.send('Welcome to express');
  });

  /**
   * Health check endpoint for monitoring.
   */
  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  });

  return app;
}