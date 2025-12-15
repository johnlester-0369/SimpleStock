/**
 * Environment Configuration Module
 *
 * Centralized, type-safe environment variable management with runtime validation.
 * Fails fast on missing required variables - validates on import.
 *
 * @module config/env.config.ts
 */
import 'dotenv/config';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Valid Node environment values.
 * Strictly typed to prevent runtime errors from invalid environment strings.
 */
type NodeEnv = 'development' | 'production' | 'test';

/**
 * Environment configuration type definition.
 * IMPORTANT: With exactOptionalPropertyTypes: true, optional properties
 * must explicitly include undefined in their type.
 */
interface EnvConfig {
  // Core application settings
  readonly NODE_ENV: NodeEnv;
  readonly PORT: string;
  
  // Logging configuration
  readonly LOG_LEVEL: string;
  readonly LOG_FILE_PATH?: string | undefined;
  readonly ERROR_LOG_FILE_PATH?: string | undefined;
  
  // Database configuration
  readonly MONGODB_URI: string;
  readonly MONGO_PASSWORD: string;
  readonly MONGO_URI: string; // Computed: MONGODB_URI with password injected
  
  // Authentication configuration
  readonly BASE_URL: string;
  readonly AUTH_SECRET_USER: string;
  readonly TRUSTED_ORIGINS?: string[] | undefined;
  
  // Derived boolean helpers
  readonly isDevelopment: boolean;
  readonly isProduction: boolean;
  readonly isTest: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Valid NODE_ENV values as a readonly for validation.
 */
const VALID_NODE_ENVS: readonly NodeEnv[] = [
  'development',
  'production',
  'test',
] as const;

/**
 * Valid log levels for winston.
 */
const VALID_LOG_LEVELS = [
  'error',
  'warn',
  'info',
  'http',
  'verbose',
  'debug',
  'silly',
] as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Retrieves a required environment variable.
 * @param key - Environment variable key
 * @returns Environment variable value
 * @throws {Error} If the variable is missing or empty
 */
function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (value === undefined || value === '') {
    throw new Error(
      `[ENV] Missing required environment variable: ${key}\n` +
        `Please check your .env file or environment configuration`,
    );
  }
  return value;
}

/**
 * Retrieves an optional environment variable.
 * @param key - Environment variable key
 * @returns Environment variable value or undefined
 */
function getOptionalEnv(key: string): string | undefined {
  const value = process.env[key];
  return value === '' ? undefined : value;
}

/**
 * Retrieves and validates NODE_ENV environment variable.
 * @returns Validated NodeEnv value
 * @throws {Error} If NODE_ENV is missing or not a valid value
 */
function getNodeEnv(): NodeEnv {
  const value = process.env.NODE_ENV;
  if (value === undefined || value === '') {
    throw new Error(
      `[ENV] Missing required environment variable: NODE_ENV\n` +
        `Valid values are: ${VALID_NODE_ENVS.join(', ')}\n` +
        `Please check your .env file or environment configuration`,
    );
  }
  if (!VALID_NODE_ENVS.includes(value as NodeEnv)) {
    throw new Error(
      `[ENV] Invalid NODE_ENV value: "${value}"\n` +
        `Valid values are: ${VALID_NODE_ENVS.join(', ')}`,
    );
  }
  return value as NodeEnv;
}

/**
 * Validates and retrieves LOG_LEVEL environment variable.
 * @returns Validated log level
 */
function getLogLevel(): string {
  const value = process.env.LOG_LEVEL ?? 'info';
  if (!VALID_LOG_LEVELS.includes(value as (typeof VALID_LOG_LEVELS)[number])) {
    console.warn(
      `[ENV] Invalid LOG_LEVEL value: "${value}". Using default: "info".\n` +
        `Valid values are: ${VALID_LOG_LEVELS.join(', ')}`,
    );
    return 'info';
  }
  return value;
}

/**
 * Parses comma-separated trusted origins into an array.
 * @param value - Comma-separated string of origins
 * @returns Array of origins or undefined if empty
 * 
 * @example
 * ```typescript
 * parseTrustedOrigins('http://localhost:3000,https://app.com')
 * // Returns: ['http://localhost:3000', 'https://app.com']
 * ```
 */
function parseTrustedOrigins(
  value: string | undefined,
): string[] | undefined {
  if (!value) return undefined;
  const arr = value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return arr.length > 0 ? arr : undefined;
}

/**
 * Builds the complete MongoDB connection URI by replacing the password placeholder.
 * 
 * The MONGODB_URI should contain a `<PASSWORD>` placeholder that will be replaced
 * with the URI-encoded MONGO_PASSWORD value.
 * 
 * @param mongodbUri - MongoDB URI template with `<PASSWORD>` placeholder
 * @param password - Password to be URI-encoded and injected
 * @returns Complete MongoDB connection URI with encoded password
 * @throws {Error} If MONGODB_URI doesn't contain `<PASSWORD>` placeholder
 * 
 * @example
 * ```typescript
 * const uri = buildMongoUri(
 *   'mongodb+srv://user:<PASSWORD>@cluster0.mongodb.net/db',
 *   'p@ssw0rd!'
 * );
 * // Returns: 'mongodb+srv://user:p%40ssw0rd!@cluster0.mongodb.net/db'
 * ```
 */
function buildMongoUri(mongodbUri: string, password: string): string {
  if (!mongodbUri.includes('<PASSWORD>')) {
    throw new Error(
      `[ENV] MONGODB_URI must contain '<PASSWORD>' placeholder.\n` +
        `Example: mongodb+srv://username:<PASSWORD>@cluster.mongodb.net/database\n` +
        `Current value does not contain the placeholder.`,
    );
  }

  // URI encode the password to handle special characters
  const encodedPassword = encodeURIComponent(password);
  
  // Replace the placeholder with the encoded password
  return mongodbUri.replace('<PASSWORD>', encodedPassword);
}

// ============================================================================
// CONFIGURATION OBJECT
// ============================================================================

// Cache NODE_ENV to avoid multiple validations
const nodeEnv = getNodeEnv();

// Get database credentials
const mongodbUri = getRequiredEnv('MONGODB_URI');
const mongoPassword = getRequiredEnv('MONGO_PASSWORD');

/**
 * Validated environment configuration.
 * Access environment variables through this object for type safety.
 *
 * @example
 * ```typescript
 * import { env } from '@/config/env.config.js';
 *
 * console.log(env.NODE_ENV);      // 'development' | 'production' | 'test'
 * console.log(env.PORT);          // '3000'
 * console.log(env.MONGO_URI);     // Complete MongoDB URI with encoded password
 * console.log(env.BASE_URL);      // 'http://localhost:3000'
 *
 * if (env.isDevelopment) {
 *   // Development-only code
 * }
 * ```
 */
export const env: EnvConfig = {
  // Core environment
  NODE_ENV: nodeEnv,
  PORT: getRequiredEnv('PORT'),

  // Logging configuration
  LOG_LEVEL: getLogLevel(),
  LOG_FILE_PATH: getOptionalEnv('LOG_FILE_PATH'),
  ERROR_LOG_FILE_PATH: getOptionalEnv('ERROR_LOG_FILE_PATH'),

  // Database configuration
  MONGODB_URI: mongodbUri,
  MONGO_PASSWORD: mongoPassword,
  MONGO_URI: buildMongoUri(mongodbUri, mongoPassword),

  // Authentication configuration
  BASE_URL: getRequiredEnv('BASE_URL'),
  AUTH_SECRET_USER: getRequiredEnv('AUTH_SECRET_USER'),
  TRUSTED_ORIGINS: parseTrustedOrigins(getOptionalEnv('TRUSTED_ORIGINS')),

  // Derived boolean helpers for convenience
  isDevelopment: nodeEnv === 'development',
  isProduction: nodeEnv === 'production',
  isTest: nodeEnv === 'test',
} as const;

/**
 * Re-export NodeEnv type for external use.
 */
export type { NodeEnv };