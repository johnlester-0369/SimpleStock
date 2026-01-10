/**
 * Database Connection Module
 *
 * Manages MongoDB connection using Mongoose for ODM functionality.
 * Note: For better-auth, use the separate mongo-client.lib.ts module
 * to avoid BSON version conflicts.
 *
 * Features:
 * - Connection caching to prevent multiple connections in dev/HMR
 * - Centralized environment configuration
 * - Async initialization pattern for proper startup sequencing
 *
 * @module lib/db.lib
 */

import mongoose from 'mongoose';
import { env } from '@/config/env.config.js';
import { logger } from '@/utils/logger.util.js';

// ============================================================================
// TYPE AUGMENTATION FOR GLOBAL CACHING
// ============================================================================

declare global {
  // eslint-disable-next-line no-var -- Required for global augmentation in Node.js
  var _mongooseConnection:
    | {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
      }
    | undefined;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const MONGO_URI = env.MONGO_URI;

/**
 * Global connection cache for development HMR (Hot Module Replacement).
 * Prevents creating multiple connections during module reloads.
 */
let cached = global._mongooseConnection;

if (!cached) {
  cached = global._mongooseConnection = {
    conn: null,
    promise: null,
  };
}

// ============================================================================
// CONNECTION MANAGEMENT
// ============================================================================

/**
 * Establishes and returns a cached Mongoose connection.
 * In development, reuses existing connections to handle HMR gracefully.
 *
 * Note: This connection is for Mongoose ODM operations only.
 * For better-auth, use connectMongoClient() from mongo-client.lib.ts.
 *
 * @returns Promise resolving to Mongoose instance
 * @throws {Error} If connection fails
 *
 * @example
 * ```typescript
 * const mongoose = await connectToDatabase();
 * console.log('Connected to:', mongoose.connection.name);
 * ```
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  // Return cached connection if available and connected
  if (cached?.conn && mongoose.connection.readyState === 1) {
    logger.debug('Using cached Mongoose connection');
    return cached.conn;
  }

  // Create new connection promise if not exists
  if (!cached?.promise) {
    const opts = {
      bufferCommands: false, // Disable Mongoose buffering - we handle connection timing
      maxPoolSize: 10, // Connection pool size
    };

    logger.info('Establishing Mongoose database connection', {
      uri: MONGO_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'), // Mask credentials
    });

    cached!.promise = mongoose
      .connect(MONGO_URI, opts)
      .then((mongooseInstance) => {
        logger.info('Mongoose connected successfully', {
          name: mongooseInstance.connection.name,
          host: mongooseInstance.connection.host,
          readyState: mongooseInstance.connection.readyState,
        });
        return mongooseInstance;
      })
      .catch((err: Error) => {
        logger.error('Mongoose connection failed', {
          error: err.message,
          stack: err.stack,
        });
        // Clear the promise so it can be retried
        cached!.promise = null;
        throw err;
      });
  }

  cached!.conn = await cached!.promise;
  return cached!.conn;
}

/**
 * Gracefully disconnects Mongoose from the database.
 * Should be called during application shutdown.
 *
 * @example
 * ```typescript
 * process.on('SIGTERM', async () => {
 *   await disconnectDatabase();
 *   process.exit(0);
 * });
 * ```
 */
export async function disconnectDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    logger.info('Disconnecting Mongoose from database');
    await mongoose.disconnect();
    cached!.conn = null;
    cached!.promise = null;
    logger.info('Mongoose disconnected');
  }
}

/**
 * Gets the Mongoose connection instance.
 * Useful for accessing the underlying connection directly.
 *
 * @returns Mongoose connection
 */
export function getMongooseConnection(): mongoose.Connection {
  return mongoose.connection;
}