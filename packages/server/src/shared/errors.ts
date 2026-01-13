/**
 * Domain Error Classes
 *
 * Custom error hierarchy for service layer exceptions.
 * Controllers translate these to appropriate HTTP responses.
 * Includes Zod error formatting utilities.
 *
 * @module shared/errors
 */

import { z } from 'zod';

// ============================================================================
// BASE ERROR CLASSES
// ============================================================================

/**
 * Base class for all domain errors.
 * Extends Error with additional metadata for proper error handling.
 */
export abstract class DomainError extends Error {
  /**
   * Error code for client identification
   */
  abstract readonly code: string;

  /**
   * HTTP status code suggestion for controllers
   */
  abstract readonly statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convert error to JSON-serializable object
   */
  toJSON(): { code: string; message: string } {
    return {
      code: this.code,
      message: this.message,
    };
  }
}

// ============================================================================
// SPECIFIC ERROR CLASSES
// ============================================================================

/**
 * Error thrown when a requested resource is not found.
 */
export class NotFoundError extends DomainError {
  readonly code = 'NOT_FOUND';
  readonly statusCode = 404;

  constructor(
    public readonly resource: string,
    public readonly identifier?: string | undefined,
  ) {
    super(
      identifier
        ? `${resource} with ID '${identifier}' not found`
        : `${resource} not found`,
    );
  }
}

/**
 * Error thrown when validation fails.
 */
export class ValidationError extends DomainError {
  readonly code = 'VALIDATION_ERROR';
  readonly statusCode = 400;

  constructor(
    message: string,
    public readonly field?: string | undefined,
    public readonly details?: ValidationErrorDetail[] | undefined,
  ) {
    super(message);
  }

  /**
   * Create ValidationError from Zod error.
   *
   * @param zodError - Zod error instance
   * @returns ValidationError with formatted details
   *
   * @example
   * ```typescript
   * try {
   *   schema.parse(input);
   * } catch (error) {
   *   if (error instanceof z.ZodError) {
   *     throw ValidationError.fromZodError(error);
   *   }
   * }
   * ```
   */
  static fromZodError(zodError: z.ZodError): ValidationError {
    const details = formatZodError(zodError);
    const firstIssue = zodError.issues[0];
    const field = firstIssue?.path.join('.') || undefined;
    const message = firstIssue?.message || 'Validation failed';

    return new ValidationError(message, field, details);
  }
}

/**
 * Validation error detail structure
 */
export interface ValidationErrorDetail {
  field: string;
  message: string;
  code: string;
}

/**
 * Error thrown when a business rule is violated.
 */
export class BusinessRuleError extends DomainError {
  readonly code = 'BUSINESS_RULE_VIOLATION';
  readonly statusCode = 400;

  constructor(message: string) {
    super(message);
  }
}

/**
 * Error thrown when there's insufficient stock for an operation.
 */
export class InsufficientStockError extends DomainError {
  readonly code = 'INSUFFICIENT_STOCK';
  readonly statusCode = 400;

  constructor(
    public readonly available: number,
    public readonly requested: number,
  ) {
    super(`Insufficient stock. Available: ${available}, Requested: ${requested}`);
  }
}

/**
 * Error thrown when an operation fails unexpectedly.
 */
export class OperationFailedError extends DomainError {
  readonly code = 'OPERATION_FAILED';
  readonly statusCode = 500;

  constructor(
    public readonly operation: string,
    public readonly reason?: string | undefined,
  ) {
    super(reason ? `${operation} failed: ${reason}` : `${operation} failed`);
  }
}

// ============================================================================
// ZOD ERROR UTILITIES
// ============================================================================

/**
 * Format Zod error into array of validation error details.
 *
 * @param error - Zod error instance
 * @returns Array of formatted error details
 *
 * @example
 * ```typescript
 * const details = formatZodError(zodError);
 * // [{ field: 'email', message: 'Invalid email', code: 'invalid_string' }]
 * ```
 */
export function formatZodError(error: z.ZodError): ValidationErrorDetail[] {
  return error.issues.map((issue) => ({
    field: issue.path.join('.') || 'root',
    message: issue.message,
    code: issue.code,
  }));
}

/**
 * Check if an error is a Zod validation error.
 *
 * @param error - Unknown error
 * @returns True if error is ZodError
 */
export function isZodError(error: unknown): error is z.ZodError {
  return error instanceof z.ZodError;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard to check if an error is a DomainError
 */
export function isDomainError(error: unknown): error is DomainError {
  return error instanceof DomainError;
}