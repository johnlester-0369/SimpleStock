/**
 * Admin User Seed Script
 *
 * Creates the initial admin user for the application.
 * Uses better-auth's admin plugin `createUser` API to create the user
 * with the admin role directly.
 *
 * This script is idempotent - running it multiple times is safe.
 *
 * @module scripts/seed-admin
 *
 * @example
 * ```bash
 * # Set environment variables first, then run:
 * npm run seed:admin
 * ```
 */

import 'dotenv/config';
import { env } from '../src/config/env.config.js';
import { logger } from '../src/utils/logger.util.js';
import { initializeAuth } from '../src/lib/auth.lib.js';
import {
  connectMongoClient,
  disconnectMongoClient,
} from '../src/lib/mongo-client.lib.js';

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Admin seed configuration from environment variables.
 * These should be set in .env or environment before running the script.
 */
interface AdminSeedConfig {
  email: string;
  password: string;
  name: string;
}

/**
 * Retrieves and validates admin seed configuration from environment.
 *
 * @returns Admin seed configuration
 * @throws {Error} If required environment variables are missing
 */
function getAdminSeedConfig(): AdminSeedConfig {
  const email = process.env.ADMIN_SEED_EMAIL;
  const password = process.env.ADMIN_SEED_PASSWORD;
  const name = process.env.ADMIN_SEED_NAME ?? 'Admin';

  if (!email) {
    throw new Error(
      '[SEED] Missing ADMIN_SEED_EMAIL environment variable.\n' +
        'Please set it in your .env file or environment.',
    );
  }

  if (!password) {
    throw new Error(
      '[SEED] Missing ADMIN_SEED_PASSWORD environment variable.\n' +
        'Please set it in your .env file or environment.',
    );
  }

  // Validate password meets minimum requirements
  const minPasswordLength = 6; // Matches auth.lib.ts config
  if (password.length < minPasswordLength) {
    throw new Error(
      `[SEED] ADMIN_SEED_PASSWORD must be at least ${minPasswordLength} characters.`,
    );
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('[SEED] ADMIN_SEED_EMAIL must be a valid email address.');
  }

  return { email, password, name };
}

// ============================================================================
// SEED LOGIC
// ============================================================================

/**
 * Seeds the initial admin user.
 *
 * Process:
 * 1. Check if admin already exists (by email)
 * 2. If exists with admin role, skip creation
 * 3. If exists without admin role, update role to admin
 * 4. If doesn't exist, create user via createUser with role='admin'
 *
 * Uses the better-auth admin plugin's createUser API which allows
 * specifying the role directly during user creation.
 *
 * @returns Promise that resolves when seeding is complete
 */
async function seedAdmin(): Promise<void> {
  logger.info('🌱 Starting admin user seed...');

  // Get configuration
  const config = getAdminSeedConfig();
  logger.info('Admin seed configuration loaded', {
    email: config.email,
    name: config.name,
  });

  // Initialize auth (also connects MongoClient)
  logger.info('Initializing authentication system...');
  const auth = await initializeAuth();

  // Get MongoDB database for direct queries (checking existing user)
  const { db } = await connectMongoClient();
  const usersCollection = db.collection('user');

  // Check if user already exists
  logger.info('Checking for existing admin user...');
  const existingUser = await usersCollection.findOne({ email: config.email });

  if (existingUser) {
    logger.info('User already exists', {
      id: existingUser.id,
      email: existingUser.email,
      currentRole: existingUser.role,
    });

    // Check if already admin
    if (existingUser.role === 'admin') {
      logger.info('✅ User is already an admin. No changes needed.');
      return;
    }

    // Update existing user to admin role using setRole API
    logger.info('Updating existing user to admin role...');
    try {
      await usersCollection.updateOne(
        { email: config.email },
        { $set: { role: 'admin', updatedAt: new Date() } },
      );

      logger.info('✅ Successfully updated user to admin role', {
        id: existingUser.id,
        email: config.email,
      });
    } catch (updateError) {
      logger.error('Failed to update user role', {
        error:
          updateError instanceof Error ? updateError.message : 'Unknown error',
      });
      throw updateError;
    }
    return;
  }

  // Create new user via better-auth admin plugin's createUser API
  // This allows specifying the role directly during creation
  logger.info('Creating new admin user via better-auth createUser API...');

  try {
    // Use the admin plugin's createUser function which accepts role parameter
    const newUser = await auth.api.createUser({
      body: {
        email: config.email,
        password: config.password,
        name: config.name,
        role: 'admin', // Directly set admin role during creation
      },
    });

    if (!newUser) {
      throw new Error(
        'createUser returned null - user creation may have failed',
      );
    }

    logger.info('✅ Admin user created successfully!', {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    });
  } catch (error) {
    // Handle specific better-auth errors
    if (error instanceof Error) {
      // Check if it's a "user already exists" type error
      if (
        error.message.includes('already exists') ||
        error.message.includes('duplicate') ||
        error.message.includes('USER_ALREADY_EXISTS')
      ) {
        logger.warn('User may already exist. Attempting to update role...');

        // Try to find and update the user
        const user = await usersCollection.findOne({ email: config.email });
        if (user) {
          await usersCollection.updateOne(
            { email: config.email },
            { $set: { role: 'admin', updatedAt: new Date() } },
          );
          logger.info('✅ Updated existing user to admin role', {
            id: user.id,
            email: config.email,
          });
          return;
        }
      }

      logger.error('Failed to create admin user', {
        error: error.message,
        stack: error.stack,
      });
    }
    throw error;
  }
}

// ============================================================================
// MAIN ENTRY POINT
// ============================================================================

/**
 * Main function that orchestrates the seed process.
 * Handles connection lifecycle and error handling.
 */
async function main(): Promise<void> {
  logger.info('='.repeat(60));
  logger.info('Admin User Seed Script');
  logger.info('='.repeat(60));
  logger.info('Environment:', { nodeEnv: env.NODE_ENV });

  try {
    await seedAdmin();
    logger.info('='.repeat(60));
    logger.info('🎉 Seed completed successfully!');
    logger.info('='.repeat(60));
  } catch (error) {
    logger.error('='.repeat(60));
    logger.error('❌ Seed failed!');
    if (error instanceof Error) {
      logger.error('Error:', { message: error.message, stack: error.stack });
    }
    logger.error('='.repeat(60));
    process.exitCode = 1;
  } finally {
    // Clean up connections
    logger.info('Cleaning up connections...');
    await disconnectMongoClient();
    logger.info('Connections closed.');
  }
}

// Run the script
main();