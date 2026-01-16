/**
 * Product Validation Schemas
 *
 * Zod schemas for product-related operations including
 * creation, updates, selling, and filtering.
 * Uses supplierId (ObjectId) instead of supplier name.
 *
 * @module validators/product.validator
 */

import { z } from 'zod';
import {
  nameSchema,
  priceSchema,
  stockQuantitySchema,
  sellQuantitySchema,
  searchQuerySchema,
  stockStatusSchema,
  objectIdSchema,
  limitSchema,
} from './common.validator.js';

// ============================================================================
// CREATE PRODUCT SCHEMA
// ============================================================================

/**
 * Schema for creating a new product.
 * All fields required. Uses supplierId (ObjectId) for supplier reference.
 */
export const createProductSchema = z.object({
  name: nameSchema,
  price: priceSchema,
  stockQuantity: stockQuantitySchema,
  supplierId: objectIdSchema,
});

/**
 * Inferred type for product creation input
 */
export type CreateProductInput = z.infer<typeof createProductSchema>;

// ============================================================================
// UPDATE PRODUCT SCHEMA
// ============================================================================

/**
 * Schema for updating an existing product.
 * All fields optional, but validated if provided.
 */
export const updateProductSchema = z.object({
  name: z
    .string({ error: 'Name must be a string' })
    .trim()
    .min(2, { error: 'Name must be at least 2 characters' })
    .max(100, { error: 'Name must not exceed 100 characters' })
    .optional(),
  price: priceSchema.optional(),
  stockQuantity: stockQuantitySchema.optional(),
  supplierId: objectIdSchema.optional(),
});

/**
 * Inferred type for product update input
 */
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

// ============================================================================
// SELL PRODUCT SCHEMA
// ============================================================================

/**
 * Schema for selling a product.
 */
export const sellProductSchema = z.object({
  quantity: sellQuantitySchema,
});

/**
 * Inferred type for sell product input
 */
export type SellProductInput = z.infer<typeof sellProductSchema>;

// ============================================================================
// FILTER SCHEMAS
// ============================================================================

/**
 * Schema for product list query parameters.
 * Uses supplierId for filtering by supplier.
 */
export const productFilterSchema = z.object({
  search: searchQuerySchema,
  stockStatus: stockStatusSchema,
  supplierId: objectIdSchema.optional(),
});

/**
 * Inferred type for product filters
 */
export type ProductFilterInput = z.infer<typeof productFilterSchema>;

/**
 * Schema for product ID parameter.
 */
export const productIdParamSchema = z.object({
  id: objectIdSchema,
});

/**
 * Schema for low stock query parameters.
 */
export const lowStockQuerySchema = z.object({
  limit: limitSchema,
});

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validates product creation input.
 *
 * @param input - Raw input data
 * @returns Validated and typed input
 * @throws {z.ZodError} If validation fails
 *
 * @example
 * ```typescript
 * const validated = validateCreateProduct({
 *   name: 'Widget',
 *   price: 9.99,
 *   stockQuantity: 100,
 *   supplierId: '507f1f77bcf86cd799439011'
 * });
 * ```
 */
export function validateCreateProduct(input: unknown): CreateProductInput {
  return createProductSchema.parse(input);
}

/**
 * Validates product update input.
 *
 * @param input - Raw input data
 * @returns Validated and typed input
 * @throws {z.ZodError} If validation fails
 */
export function validateUpdateProduct(input: unknown): UpdateProductInput {
  return updateProductSchema.parse(input);
}

/**
 * Validates sell product input.
 *
 * @param input - Raw input data
 * @returns Validated and typed input
 * @throws {z.ZodError} If validation fails
 */
export function validateSellProduct(input: unknown): SellProductInput {
  return sellProductSchema.parse(input);
}

/**
 * Validates product filter query parameters.
 *
 * @param input - Raw query parameters
 * @returns Validated and typed filters
 * @throws {z.ZodError} If validation fails
 */
export function validateProductFilter(input: unknown): ProductFilterInput {
  return productFilterSchema.parse(input);
}

/**
 * Safe validation that returns result object instead of throwing.
 *
 * @param schema - Zod schema to use
 * @param input - Raw input data
 * @returns SafeParseResult with success flag and data/error
 */
export function safeValidateCreateProduct(input: unknown) {
  return createProductSchema.safeParse(input);
}

export function safeValidateUpdateProduct(input: unknown) {
  return updateProductSchema.safeParse(input);
}

export function safeValidateSellProduct(input: unknown) {
  return sellProductSchema.safeParse(input);
}