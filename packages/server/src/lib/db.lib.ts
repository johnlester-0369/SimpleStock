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
 * - Async initialization pattern for proper startup sequencing
 *
 * @module lib/db.lib
 */

import mongoose from 'mongoose';
import type { Db, MongoClient } from 'mongodb';
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
    logger.debug('Using cached database connection');
    return cached.conn;
  }

  // Create new connection promise if not exists
  if (!cached?.promise) {
    const opts = {
      bufferCommands: false, // Disable Mongoose buffering - we handle connection timing
      maxPoolSize: 10, // Connection pool size
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
      .catch((err: Error) => {
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
 * IMPORTANT: Only call this after `connectToDatabase()` has resolved.
 *
 * @returns MongoDB Db instance
 * @throws {Error} If connection is not established
 *
 * @example
 * ```typescript
 * await connectToDatabase();
 * const db = getDb();
 * const adapter = mongodbAdapter(db, { client: getMongoClient() });
 * ```
 */
export function getDb(): Db {
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error(
      'Database connection not established. Call and await connectToDatabase() first.',
    );
  }
  return db;
}

/**
 * Returns the native MongoClient from Mongoose connection.
 * Required for better-auth transaction support.
 *
 * IMPORTANT: Only call this after `connectToDatabase()` has resolved.
 *
 * @returns MongoClient instance
 * @throws {Error} If connection is not established
 *
 * @example
 * ```typescript
 * await connectToDatabase();
 * const client = getMongoClient();
 * const adapter = mongodbAdapter(db, { client });
 * ```
 */
export function getMongoClient(): MongoClient {
  const client = mongoose.connection.getClient();
  if (!client) {
    throw new Error(
      'Database connection not established. Call and await connectToDatabase() first.',
    );
  }
  return client as MongoClient;
}

/**
 * Gets database connection details for better-auth adapter.
 * This is the recommended way to get both db and client for better-auth.
 *
 * IMPORTANT: Only call this after `connectToDatabase()` has resolved.
 *
 * @returns Object containing db and mongoClient for better-auth adapter
 * @throws {Error} If connection is not established
 *
 * @example
 * ```typescript
 * await connectToDatabase();
 * const { db, mongoClient } = getDbConnection();
 * const adapter = mongodbAdapter(db, { client: mongoClient });
 * ```
 */
export function getDbConnection(): { db: Db; mongoClient: MongoClient } {
  return {
    db: getDb(),
    mongoClient: getMongoClient(),
  };
}