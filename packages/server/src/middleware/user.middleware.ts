/**
 * User Authentication Middleware
 *
 * Verifies user session using Better Auth and attaches user info to request.
 * All protected routes should use this middleware.
 *
 * @module middleware/user.middleware
 */

import type { Request, Response, NextFunction } from 'express';
import { getAuth } from '@/lib/auth.lib.js';
import { logger } from '@/utils/logger.util.js';

/**
 * Middleware to require authenticated user session.
 * Verifies the session cookie and attaches user to request.
 *
 * @example
 * ```typescript
 * router.use(requireUser);
 * router.get('/protected', (req, res) => {
 *   const userId = req.user!.id;
 * });
 * ```
 */
export const requireUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const auth = getAuth();

    // Get session from Better Auth (cookies are automatically parsed)
    const session = await auth.api.getSession({
      headers: req.headers as Record<string, string>,
    });

    if (!session || !session.user) {
      logger.warn('Unauthorized access attempt', {
        ip: req.ip,
        path: req.path,
        method: req.method,
      });
      res.status(401).json({ error: 'Unauthorized. Please login.' });
      return;
    }

    // Attach user info to request for use in controllers
    req.user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
    };

    next();
  } catch (error) {
    logger.error('User auth middleware error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      path: req.path,
    });
    res.status(500).json({ error: 'Authentication error' });
  }
};