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

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Extended user type that includes the role field added by better-auth admin plugin.
 * The admin plugin adds a `role` field to users, but this isn't reflected in the
 * base better-auth types. We define this interface to properly type the session user.
 */
interface AdminPluginUser {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  role?: string;
  banned?: boolean;
  banReason?: string | null;
  banExpires?: Date | null;
}

// ============================================================================
// MIDDLEWARE
// ============================================================================

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

    // Cast user to include admin plugin fields (role, banned, etc.)
    // The admin plugin extends the user schema with these fields
    const user = session.user as AdminPluginUser;

    // Attach user info to request for use in controllers
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
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