/**
 * Server Entry Point
 *
 * Orchestrates application startup:
 * 1. Initialize database connection
 * 2. Initialize authentication system
 * 3. Create and start Express server
 *
 * This ensures proper dependency ordering - the database must be connected
 * before Better Auth can be initialized, and both must be ready before
 * the server starts accepting requests.
 *
 * @module server
 */

import { env } from '@/config/env.config.js';
import { logger } from '@/utils/logger.util.js';
import { initializeAuth } from '@/lib/auth.lib.js';
import { disconnectDatabase } from '@/lib/db.lib.js';
import { createApp } from '@/app.js';

// ============================================================================
// CONFIGURATION
// ============================================================================

const PORT = env.PORT;

// ============================================================================
// STARTUP
// ============================================================================

/**
 * Initializes and starts the application.
 * Handles the complete startup sequence with proper error handling.
 */
async function startServer(): Promise<void> {
  try {
    logger.info('Starting application...');

    // Step 1: Initialize auth (which also connects to database)
    logger.info('Initializing authentication system...');
    const auth = await initializeAuth();

    // Step 2: Create Express app with auth
    logger.info('Creating Express application...');
    const app = createApp(auth);

    // Step 3: Start HTTP server
    const server = app.listen(PORT, () => {
      logger.info('🚀 Server Started Successfully', {
        port: PORT,
        environment: env.NODE_ENV,
        logLevel: env.LOG_LEVEL,
      });
    });

    // ==========================================================================
    // GRACEFUL SHUTDOWN
    // ==========================================================================

    /**
     * Handles graceful shutdown on SIGTERM/SIGINT.
     * Closes HTTP server and database connections cleanly.
     */
    const gracefulShutdown = async (signal: string): Promise<void> => {
      logger.info(`Received ${signal}. Starting graceful shutdown...`);

      // Stop accepting new connections
      server.close(async (err) => {
        if (err) {
          logger.error('Error closing HTTP server', { error: err.message });
        } else {
          logger.info('HTTP server closed');
        }

        // Disconnect from database
        try {
          await disconnectDatabase();
          logger.info('Database connection closed');
        } catch (dbErr) {
          logger.error('Error closing database connection', {
            error: dbErr instanceof Error ? dbErr.message : 'Unknown error',
          });
        }

        process.exit(err ? 1 : 0);
      });

      // Force shutdown after 10 seconds if graceful shutdown fails
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Register shutdown handlers
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start application', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Exit with error code in production, keep running for debugging in dev
    if (env.isProduction) {
      process.exit(1);
    }
  }
}

// ============================================================================
// ENTRY POINT
// ============================================================================

// Start the server
startServer();