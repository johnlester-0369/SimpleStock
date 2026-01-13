/**
 * Transaction Validation Schemas
 *
 * Zod schemas for transaction-related operations including
 * filtering and query parameters.
 *
 * @module validators/transaction.validator
 */

import { z } from 'zod';
import {
  searchQuerySchema,
  periodSchema,
  objectIdSchema,
  limitSchema,
  optionalIsoDateStringSchema,
} from './common.validator.js';

// ============================================================================
// FILTER SCHEMAS
// ============================================================================

/**
 * Schema for transaction list query parameters.
 */
export const transactionFilterSchema = z.object({
  search: searchQuerySchema,
  period: periodSchema,
  startDate: optionalIsoDateStringSchema,
  endDate: optionalIsoDateStringSchema,
});

/**
 * Inferred type for transaction filters
 */
export type TransactionFilterInput = z.infer<typeof transactionFilterSchema>;

/**
 * Schema for transaction ID parameter.
 */
export const transactionIdParamSchema = z.object({
  id: objectIdSchema,
});

/**
 * Schema for transaction stats query parameters.
 */
export const transactionStatsQuerySchema = z.object({
  period: periodSchema,
  startDate: optionalIsoDateStringSchema,
  endDate: optionalIsoDateStringSchema,
});

/**
 * Inferred type for transaction stats query
 */
export type TransactionStatsInput = z.infer<typeof transactionStatsQuerySchema>;

/**
 * Schema for daily sales query parameters.
 */
export const dailySalesQuerySchema = z.object({
  period: periodSchema,
  startDate: optionalIsoDateStringSchema,
  endDate: optionalIsoDateStringSchema,
});

/**
 * Inferred type for daily sales query
 */
export type DailySalesInput = z.infer<typeof dailySalesQuerySchema>;

/**
 * Schema for recent transactions query parameters.
 */
export const recentTransactionsQuerySchema = z.object({
  limit: limitSchema,
});

/**
 * Inferred type for recent transactions query
 */
export type RecentTransactionsInput = z.infer<typeof recentTransactionsQuerySchema>;

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validates transaction filter query parameters.
 *
 * @param input - Raw query parameters
 * @returns Validated and typed filters
 * @throws {z.ZodError} If validation fails
 *
 * @example
 * ```typescript
 * const validated = validateTransactionFilter({
 *   search: 'widget',
 *   period: 'week',
 * });
 * ```
 */
export function validateTransactionFilter(input: unknown): TransactionFilterInput {
  return transactionFilterSchema.parse(input);
}

/**
 * Validates transaction stats query parameters.
 *
 * @param input - Raw query parameters
 * @returns Validated and typed query
 * @throws {z.ZodError} If validation fails
 */
export function validateTransactionStats(input: unknown): TransactionStatsInput {
  return transactionStatsQuerySchema.parse(input);
}

/**
 * Validates daily sales query parameters.
 *
 * @param input - Raw query parameters
 * @returns Validated and typed query
 * @throws {z.ZodError} If validation fails
 */
export function validateDailySales(input: unknown): DailySalesInput {
  return dailySalesQuerySchema.parse(input);
}

/**
 * Validates recent transactions query parameters.
 *
 * @param input - Raw query parameters
 * @returns Validated and typed query
 * @throws {z.ZodError} If validation fails
 */
export function validateRecentTransactions(input: unknown): RecentTransactionsInput {
  return recentTransactionsQuerySchema.parse(input);
}

/**
 * Safe validation functions that return result objects.
 */
export function safeValidateTransactionFilter(input: unknown) {
  return transactionFilterSchema.safeParse(input);
}

export function safeValidateTransactionStats(input: unknown) {
  return transactionStatsQuerySchema.safeParse(input);
}