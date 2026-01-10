/**
 * MongoDB Client Module
 *
 * Standalone MongoClient connection for better-auth adapter.
 * This is separate from Mongoose to avoid BSON version conflicts.
 *
 * Mongoose bundles its own MongoDB driver version which may conflict
 * with better-auth's expected driver version. Using a standalone
 * MongoClient ensures compatibility.
 *
 * @module lib/mongo-client.lib
 */

import { MongoClient, type Db, ServerApiVersion } from 'mongodb';
import { env } from '@/config/env.config.js';
import { logger } from '@/utils/logger.util.js';

// ============================================================================
// TYPE AUGMENTATION FOR GLOBAL CACHING
// ============================================================================

declare global {
  // eslint-disable-next-line no-var -- Required for global augmentation in Node.js
  var _mongoClientConnection:
    | {
        client: MongoClient | null;
        db: Db | null;
        promise: Promise<{ client: MongoClient; db: Db }> | null;
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
let cached = global._mongoClientConnection;

if (!cached) {
  cached = global._mongoClientConnection = {
    client: null,
    db: null,
    promise: null,
  };
}

// ============================================================================
// CONNECTION MANAGEMENT
// ============================================================================

/**
 * Establishes and returns a cached MongoDB connection using native MongoClient.
 * This connection is specifically for better-auth to avoid BSON version conflicts
 * with Mongoose's bundled MongoDB driver.
 *
 * @returns Promise resolving to object with client and db
 * @throws {Error} If connection fails
 *
 * @example
 * ```typescript
 * const { client, db } = await connectMongoClient();
 * const adapter = mongodbAdapter(db, { client });
 * ```
 */
export async function connectMongoClient(): Promise<{
  client: MongoClient;
  db: Db;
}> {
  // Return cached connection if available
  if (cached?.client && cached?.db) {
    logger.debug('Using cached MongoClient connection');
    return { client: cached.client, db: cached.db };
  }

  // Create new connection promise if not exists
  if (!cached?.promise) {
    const options = {
      maxPoolSize: 10,
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    };

    logger.info('Establishing MongoClient connection for auth', {
      uri: MONGO_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'), // Mask credentials
    });

    cached!.promise = (async () => {
      try {
        const client = new MongoClient(MONGO_URI, options);
        await client.connect();

        // Extract database name from URI or use default
        const dbName = extractDbNameFromUri(MONGO_URI);
        const db = client.db(dbName);

        logger.info('MongoClient connected successfully for auth', {
          database: dbName,
        });

        return { client, db };
      } catch (err) {
        const error = err as Error;
        logger.error('MongoClient connection failed', {
          error: error.message,
          stack: error.stack,
        });
        // Clear the promise so it can be retried
        cached!.promise = null;
        throw err;
      }
    })();
  }

  const result = await cached!.promise;
  cached!.client = result.client;
  cached!.db = result.db;

  return result;
}

/**
 * Extracts database name from MongoDB URI.
 *
 * @param uri - MongoDB connection URI
 * @returns Database name or undefined for default
 *
 * @example
 * ```typescript
 * extractDbNameFromUri('mongodb+srv://user:pass@cluster.mongodb.net/mydb?options')
 * // Returns: 'mydb'
 * ```
 */
function extractDbNameFromUri(uri: string): string | undefined {
  try {
    // Handle mongodb+srv:// and mongodb:// schemes
    // Format: mongodb[+srv]://[user:pass@]host[:port]/[database][?options]
    const withoutProtocol = uri.replace(/^mongodb(\+srv)?:\/\//, '');
    const withoutAuth = withoutProtocol.replace(/^[^@]+@/, '');
    const pathPart = withoutAuth.split('/')[1];

    if (!pathPart) {
      return undefined;
    }

    // Remove query parameters
    const dbName = pathPart.split('?')[0];
    return dbName || undefined;
  } catch {
    return undefined;
  }
}

/**
 * Gracefully disconnects the MongoClient connection.
 * Should be called during application shutdown.
 *
 * @example
 * ```typescript
 * process.on('SIGTERM', async () => {
 *   await disconnectMongoClient();
 *   process.exit(0);
 * });
 * ```
 */
export async function disconnectMongoClient(): Promise<void> {
  if (cached?.client) {
    logger.info('Disconnecting MongoClient');
    await cached.client.close();
    cached.client = null;
    cached.db = null;
    cached.promise = null;
    logger.info('MongoClient disconnected');
  }
}

/**
 * Gets the MongoClient instance.
 * Throws if not connected.
 *
 * @returns MongoClient instance
 * @throws {Error} If not connected
 */
export function getMongoClient(): MongoClient {
  if (!cached?.client) {
    throw new Error(
      'MongoClient not connected. Call connectMongoClient() first.',
    );
  }
  return cached.client;
}

/**
 * Gets the MongoDB Db instance.
 * Throws if not connected.
 *
 * @returns Db instance
 * @throws {Error} If not connected
 */
export function getAuthDb(): Db {
  if (!cached?.db) {
    throw new Error(
      'MongoClient not connected. Call connectMongoClient() first.',
    );
  }
  return cached.db;
}