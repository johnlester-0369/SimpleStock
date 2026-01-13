/**
 * Type augmentation for Express Request
 * Extends the Request interface to include authenticated user information.
 *
 * IMPORTANT: With exactOptionalPropertyTypes: true (tsconfig.json),
 * optional properties must explicitly include undefined in their type
 * to allow assigning undefined values.
 *
 * @module types/express.d
 */
declare global {
  namespace Express {
    interface Request {
      /**
       * Authenticated user information attached by auth middleware.
       * Only present after successful authentication via requireUser middleware.
       */
      user?: {
        /** Unique user identifier from Better Auth */
        id: string;
        /** User's email address */
        email: string;
        /** User's display name */
        name: string;
        /**
         * User's role from admin plugin (e.g., 'user', 'admin').
         * Explicitly includes undefined for exactOptionalPropertyTypes compliance.
         */
        role?: string | undefined;
        /** Allow additional properties for extensibility */
        [key: string]: unknown;
      };
    }
  }
}

export {};