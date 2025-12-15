/**
 * Database Connection Module
 *
 * Manages MongoDB connection using Mongoose with better-auth integration.
 * Exports both the Mongoose connection and native MongoClient for better-auth adapter.
 *
 * Features:
 * - Connection caching to prevent multiple connections in dev/HMR
 * - Native MongoClient extraction for better-auth transaction support
 * - Centralized environment configuration
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
  // Return cached connection if available
  if (cached?.conn) {
    logger.debug('Using cached database connection');
    return cached.conn;
  }

  // Create new connection promise if not exists
  if (!cached?.promise) {
    const opts = {
      bufferCommands: false, // Disable Mongoose buffering
      maxPoolSize: 10,       // Connection pool size
    };

    logger.info('Establishing new database connection', {
      uri: MONGO_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'), // Mask credentials
    });

    cached!.promise = mongoose
      .connect(MONGO_URI, opts)
      .then((mongooseInstance) => {
        logger.info('Database connected successfully', {
          name: mongooseInstance.connection.name,
          host: mongooseInstance.connection.host,
          readyState: mongooseInstance.connection.readyState,
        });
        return mongooseInstance;
      })
      .catch((err) => {
        logger.error('Database connection failed', {
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
 * Gracefully disconnects from the database.
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
    logger.info('Disconnecting from database');
    await mongoose.disconnect();
    cached!.conn = null;
    cached!.promise = null;
    logger.info('Database disconnected');
  }
}

// ============================================================================
// BETTER-AUTH INTEGRATION
// ============================================================================

/**
 * Returns the native MongoDB database instance from Mongoose connection.
 * Used by better-auth mongodbAdapter.
 *
 * Note: Type assertion used due to version mismatch between Mongoose's
 * bundled MongoDB driver and standalone mongodb package types.
 * Both are functionally compatible at runtime.
 *
 * @returns MongoDB Db instance
 * @throws {Error} If connection is not established
 *
 * @example
 * ```typescript
 * import { getDb } from '@/lib/db.lib.js';
 * import { mongodbAdapter } from 'better-auth/adapters/mongodb';
 *
 * const db = getDb();
 * const adapter = mongodbAdapter(db, { client: getMongoClient() });
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Type mismatch between Mongoose bundled and standalone MongoDB driver types
export function getDb(): any {
  if (!mongoose.connection.db) {
    throw new Error(
      'Database connection not established. Call connectToDatabase() first.',
    );
  }
  // Type assertion: Mongoose bundles its own MongoDB driver version
  // which may differ from the standalone mongodb package types
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Runtime compatibility verified; type-only issue
  return mongoose.connection.db as any;
}

/**
 * Returns the native MongoClient from Mongoose connection.
 * Required for better-auth transaction support.
 *
 * Note: Type assertion used due to version mismatch between Mongoose's
 * bundled MongoDB driver and standalone mongodb package types.
 * Both are functionally compatible at runtime.
 *
 * @returns MongoClient instance
 * @throws {Error} If connection is not established
 *
 * @example
 * ```typescript
 * import { getMongoClient } from '@/lib/db.lib.js';
 * import { mongodbAdapter } from 'better-auth/adapters/mongodb';
 *
 * const client = getMongoClient();
 * const adapter = mongodbAdapter(db, { client });
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Type mismatch between Mongoose bundled and standalone MongoDB driver types
export function getMongoClient(): any {
  if (!mongoose.connection.getClient) {
    throw new Error(
      'Database connection not established. Call connectToDatabase() first.',
    );
  }
  // Type assertion: Mongoose bundles its own MongoDB driver version
  // which may differ from the standalone mongodb package types
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Runtime compatibility verified; type-only issue
  return mongoose.connection.getClient() as any;
}

/**
 * Convenience exports for better-auth adapter.
 * These proxies ensure connection is established before accessing.
 *
 * Usage:
 * ```typescript
 * import { db, mongoClient } from '@/lib/db.lib.js';
 * import { mongodbAdapter } from 'better-auth/adapters/mongodb';
 *
 * const adapter = mongodbAdapter(db, { client: mongoClient });
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Proxy wrapper for Mongoose MongoDB types; see getDb()
export const db = new Proxy({} as any, {
  get(_target, prop) {
    const dbInstance = getDb();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Dynamic property access on MongoDB Db instance
    return dbInstance[prop as any];
  },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Proxy wrapper for Mongoose MongoClient types; see getMongoClient()
export const mongoClient = new Proxy({} as any, {
  get(_target, prop) {
    const client = getMongoClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Dynamic property access on MongoClient instance
    return client[prop as any];
  },
});

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Auto-connect on module import.
 * Ensures database is ready when auth system initializes.
 */
connectToDatabase().catch((err) => {
  logger.error('Failed to initialize database connection', {
    error: err.message,
  });
  // In production, we might want to exit the process
  if (env.isProduction) {
    process.exit(1);
  }
});