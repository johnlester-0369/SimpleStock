/**
 * Common Validation Schemas
 *
 * Reusable Zod schemas for common validation patterns across the application.
 * Uses Zod 4 API with unified error parameter.
 *
 * @module validators/common.validator
 */

import { z } from 'zod';

// ============================================================================
// STRING VALIDATORS
// ============================================================================

/**
 * MongoDB ObjectId validation schema.
 * Validates 24-character hexadecimal strings.
 */
export const objectIdSchema = z
  .string({ error: 'ID must be a string' })
  .regex(/^[a-fA-F0-9]{24}$/, { error: 'Invalid ID format' });

/**
 * Non-empty trimmed string schema.
 * Trims whitespace and ensures non-empty result.
 */
export const nonEmptyStringSchema = z
  .string({ error: 'Value must be a string' })
  .trim()
  .min(1, { error: 'Value cannot be empty' });

/**
 * Name field schema (2-100 characters).
 * Used for product names, supplier names, contact persons.
 */
export const nameSchema = z
  .string({ error: 'Name must be a string' })
  .trim()
  .min(2, { error: 'Name must be at least 2 characters' })
  .max(100, { error: 'Name must not exceed 100 characters' });

/**
 * Optional name field schema.
 * Validates only if provided.
 */
export const optionalNameSchema = nameSchema.optional();

// ============================================================================
// NUMERIC VALIDATORS
// ============================================================================

/**
 * Positive price schema (min $0.01).
 */
export const priceSchema = z
  .number({ error: 'Price must be a number' })
  .min(0.01, { error: 'Price must be at least $0.01' });

/**
 * Non-negative quantity schema.
 */
export const stockQuantitySchema = z
  .number({ error: 'Stock quantity must be a number' })
  .int({ error: 'Stock quantity must be a whole number' })
  .min(0, { error: 'Stock quantity must be 0 or greater' });

/**
 * Positive integer schema for sell quantities.
 */
export const sellQuantitySchema = z
  .number({ error: 'Quantity must be a number' })
  .int({ error: 'Quantity must be a whole number' })
  .min(1, { error: 'Quantity must be at least 1' });

/**
 * Pagination limit schema.
 */
export const limitSchema = z.coerce
  .number({ error: 'Limit must be a number' })
  .int({ error: 'Limit must be a whole number' })
  .min(1, { error: 'Limit must be at least 1' })
  .max(100, { error: 'Limit must not exceed 100' })
  .default(10);

// ============================================================================
// DATE VALIDATORS
// ============================================================================

/**
 * ISO date string schema.
 * Validates ISO 8601 date strings.
 */
export const isoDateStringSchema = z
  .string({ error: 'Date must be a string' })
  .datetime({ error: 'Invalid date format. Use ISO 8601 format.' })
  .or(z.string().date({ error: 'Invalid date format' }));

/**
 * Optional ISO date string schema.
 */
export const optionalIsoDateStringSchema = isoDateStringSchema.optional();

// ============================================================================
// CONTACT VALIDATORS
// ============================================================================

/**
 * Email validation schema using Zod 4 top-level email.
 */
export const emailSchema = z
  .email({ error: 'Invalid email format' })
  .trim()
  .toLowerCase();

/**
 * Phone number schema.
 * Basic validation - allows various phone formats.
 */
export const phoneSchema = z
  .string({ error: 'Phone must be a string' })
  .trim()
  .min(1, { error: 'Phone number is required' });

/**
 * Optional address schema.
 */
export const addressSchema = z
  .string({ error: 'Address must be a string' })
  .trim()
  .optional()
  .default('');

// ============================================================================
// FILTER VALIDATORS
// ============================================================================

/**
 * Search query string schema.
 * Optional, trimmed string for search operations.
 */
export const searchQuerySchema = z
  .string({ error: 'Search must be a string' })
  .trim()
  .optional();

/**
 * Stock status filter schema.
 */
export const stockStatusSchema = z
  .enum(['all', 'in-stock', 'low-stock', 'out-of-stock'], {
    error: 'Invalid stock status. Must be: all, in-stock, low-stock, or out-of-stock',
  })
  .optional();

/**
 * Transaction period filter schema.
 */
export const periodSchema = z
  .enum(['today', 'week', 'month'], {
    error: 'Invalid period. Must be: today, week, or month',
  })
  .optional();

// ============================================================================
// TYPE EXPORTS
// ============================================================================

/**
 * Inferred types from common schemas
 */
export type ObjectId = z.infer<typeof objectIdSchema>;
export type StockStatus = z.infer<typeof stockStatusSchema>;
export type TransactionPeriod = z.infer<typeof periodSchema>;