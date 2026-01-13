/**
 * Authentication Module
 *
 * Configures Better Auth with MongoDB adapter, email/password authentication,
 * and admin plugin. Uses a standalone MongoClient to avoid BSON version
 * conflicts with Mongoose.
 *
 * This module uses async initialization to ensure the database connection
 * is established before creating the auth instance.
 *
 * @module lib/auth.lib
 */

import { betterAuth, type BetterAuthPlugin } from 'better-auth';
import { admin } from 'better-auth/plugins';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { env } from '@/config/env.config.js';
import { connectMongoClient } from './mongo-client.lib.js';
import { logger } from '@/utils/logger.util.js';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Type for the Better Auth instance.
 */
export type AuthInstance = ReturnType<typeof betterAuth>;

// ============================================================================
// CACHED AUTH INSTANCE
// ============================================================================

/**
 * Cached auth instance to prevent recreation on multiple imports.
 */
let authInstance: AuthInstance | null = null;

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Initializes the authentication system.
 * This function ensures the MongoDB connection is established using a
 * standalone MongoClient (not Mongoose) before creating the Better Auth
 * instance. This avoids BSON version conflicts.
 *
 * This should be called once during application startup, before starting
 * the HTTP server.
 *
 * @returns Promise resolving to the configured auth instance
 * @throws {Error} If database connection fails
 *
 * @example
 * ```typescript
 * import { initializeAuth, getAuth } from '@/lib/auth.lib.js';
 *
 * // During startup
 * await initializeAuth();
 *
 * // Later, in route handlers
 * const auth = getAuth();
 * app.use('/api/v1/admin/auth/*', toNodeHandler(auth));
 * ```
 */
export async function initializeAuth(): Promise<AuthInstance> {
  if (authInstance) {
    logger.debug('Using cached auth instance');
    return authInstance;
  }

  logger.info('Initializing authentication system...');

  // Connect using standalone MongoClient (not Mongoose) to avoid BSON conflicts
  const { client, db } = await connectMongoClient();

  logger.info('Creating Better Auth instance with MongoDB adapter');

  // Create the auth instance with standalone MongoClient
  authInstance = betterAuth({
    // Database adapter with transaction support using standalone client
    database: mongodbAdapter(db, {
      client,
    }),

    // Base configuration
    baseURL: env.BASE_URL,
    basePath: '/api/v1/admin/auth',
    secret: env.AUTH_SECRET_USER,

    // Email/password authentication
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false, // Set to true in production
      minPasswordLength: 6,
    },

    // CORS configuration
    ...(env.TRUSTED_ORIGINS ? { trustedOrigins: env.TRUSTED_ORIGINS } : {}),

    // Session configuration
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days in seconds
      updateAge: 60 * 60 * 24, // Update expiry every 24 hours
    },

    // Rate limiting
    rateLimit: {
      enabled: true,
      storage: 'database' as const,
      customRules: {
        '/sign-in/email': { window: 10, max: 3 }, // 3 attempts per 10 seconds
        '/sign-up/email': { window: 60, max: 5 }, // 5 attempts per minute
      },
    },

    // Cookie configuration
    advanced: {
      cookiePrefix: 'admin',
    },

    // Plugins
    plugins: [
      // Admin plugin with role management
      // Cast required due to potential type version mismatch between packages
      admin({
        defaultRole: 'user',
        adminRoles: ['admin'],
      }) as unknown as BetterAuthPlugin,
    ] as BetterAuthPlugin[],
  });

  logger.info('Authentication system initialized successfully');

  return authInstance;
}

/**
 * Returns the initialized auth instance.
 * Throws if `initializeAuth()` has not been called.
 *
 * @returns The configured auth instance
 * @throws {Error} If auth has not been initialized
 *
 * @example
 * ```typescript
 * import { getAuth } from '@/lib/auth.lib.js';
 *
 * const auth = getAuth();
 * const session = await auth.api.getSession({ headers: req.headers });
 * ```
 */
export function getAuth(): AuthInstance {
  if (!authInstance) {
    throw new Error(
      'Auth not initialized. Call initializeAuth() before using getAuth().',
    );
  }
  return authInstance;
}

/**
 * Alias for getAuth() - returns the admin auth instance.
 * Provides backward compatibility with existing code.
 *
 * @returns The configured auth instance
 * @throws {Error} If auth has not been initialized
 */
export function getAuthUser(): AuthInstance {
  return getAuth();
}