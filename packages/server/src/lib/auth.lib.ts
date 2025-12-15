/**
 * Authentication Module
 *
 * Configures Better Auth with MongoDB adapter, email/password authentication,
 * and admin plugin. Uses centralized environment configuration.
 *
 * @module lib/auth.lib
 */

import { betterAuth, type BetterAuthPlugin } from 'better-auth';
import { admin } from 'better-auth/plugins';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { env } from '@/config/env.config.js';
import { db, mongoClient } from './db.lib.js';

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Better Auth configuration with MongoDB adapter.
 *
 * Features:
 * - Email/password authentication (no email verification required in dev)
 * - Admin plugin for role-based access control
 * - Session management (7-day expiry, 24-hour refresh)
 * - Rate limiting on sensitive endpoints
 * - Transaction support via MongoClient
 *
 * Environment Variables Required:
 * - BASE_URL: Application base URL for redirect URIs
 * - AUTH_SECRET_USER: Secret for encryption/hashing (min 32 chars)
 * - TRUSTED_ORIGINS: (Optional) Comma-separated allowed origins
 */
export const authUser = betterAuth({
  // Database adapter with transaction support
  database: mongodbAdapter(db, {
    client: mongoClient,
  }),

  // Base configuration
  baseURL: env.BASE_URL,
  basePath: '/api/v1/user/auth',
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
    expiresIn: 60 * 60 * 24 * 7,  // 7 days in seconds
    updateAge: 60 * 60 * 24,       // Update expiry every 24 hours
  },

  // Rate limiting
  rateLimit: {
    enabled: true,
    storage: 'database' as const,
    customRules: {
      '/sign-in/email': { window: 10, max: 3 },  // 3 attempts per 10 seconds
      '/sign-up/email': { window: 60, max: 5 },  // 5 attempts per minute
    },
  },

  // Cookie configuration
  advanced: {
    cookiePrefix: 'user',
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

/**
 * Default auth instance export.
 * Use this for API route handlers and middleware.
 *
 * @example
 * ```typescript
 * import { authUser } from '@/lib/auth.lib.js';
 *
 * app.use('/api/v1/user/auth/*', authUser.handler);
 * ```
 */
export const auth = authUser;

/**
 * Type export for auth instance.
 * Useful for typing custom middleware and plugins.
 */
export type AuthInstance = typeof auth;