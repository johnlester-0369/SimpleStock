/**
 * Product Validation Schemas
 *
 * Zod schemas for product CRUD operations including
 * creation, updates, and selling.
 * Now uses supplierId instead of supplier name.
 *
 * @module validators/product.validator
 */

import { z } from 'zod'
import {
  nameSchema,
  priceSchema,
  stockQuantitySchema,
  sellQuantitySchema,
  validateForm,
  type ValidationResult,
} from './common.validator'

// ============================================================================
// SUPPLIER ID SCHEMA
// ============================================================================

/**
 * MongoDB ObjectId validation schema for supplierId.
 * Validates 24-character hexadecimal strings.
 */
const supplierIdSchema = z
  .string({ error: 'Supplier ID must be a string' })
  .min(1, { error: 'Supplier is required' })
  .regex(/^[a-fA-F0-9]{24}$/, { error: 'Invalid supplier ID format' })

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
  supplierId: supplierIdSchema,
})

/**
 * Inferred type for product creation input
 */
export type CreateProductInput = z.infer<typeof createProductSchema>

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
  supplierId: z
    .string({ error: 'Supplier ID must be a string' })
    .regex(/^[a-fA-F0-9]{24}$/, { error: 'Invalid supplier ID format' })
    .optional(),
})

/**
 * Inferred type for product update input
 */
export type UpdateProductInput = z.infer<typeof updateProductSchema>

// ============================================================================
// SELL PRODUCT SCHEMA
// ============================================================================

/**
 * Schema for selling a product.
 * Validates quantity is a positive integer.
 */
export const sellProductSchema = z.object({
  quantity: sellQuantitySchema,
})

/**
 * Inferred type for sell product input
 */
export type SellProductInput = z.infer<typeof sellProductSchema>

/**
 * Creates a sell product schema with dynamic max quantity constraint.
 *
 * @param maxQuantity - Maximum available stock quantity
 * @returns Zod schema for sell form validation
 *
 * @example
 * ```typescript
 * const schema = createSellProductSchema(10)
 * const result = schema.safeParse({ quantity: 5 }) // success
 * const result2 = schema.safeParse({ quantity: 15 }) // error: exceeds stock
 * ```
 */
export const createSellProductSchema = (maxQuantity: number) =>
  z.object({
    quantity: sellQuantitySchema.refine((val) => val <= maxQuantity, {
      error: `Insufficient stock. Only ${maxQuantity} available.`,
    }),
  })

/**
 * Inferred type for dynamic sell schema
 */
export type SellProductFormData = z.infer<ReturnType<typeof createSellProductSchema>>

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validates product creation input.
 * Uses supplierId instead of supplier name.
 *
 * @param data - Raw form data
 * @returns ValidationResult with typed CreateProductInput
 *
 * @example
 * ```typescript
 * const result = validateCreateProduct({
 *   name: 'Widget',
 *   price: 9.99,
 *   stockQuantity: 100,
 *   supplierId: '507f1f77bcf86cd799439011'
 * })
 * ```
 */
export function validateCreateProduct(
  data: unknown,
): ValidationResult<CreateProductInput> {
  return validateForm(createProductSchema, data)
}

/**
 * Validates product update input.
 *
 * @param data - Raw form data
 * @returns ValidationResult with typed UpdateProductInput
 */
export function validateUpdateProduct(
  data: unknown,
): ValidationResult<UpdateProductInput> {
  return validateForm(updateProductSchema, data)
}

/**
 * Validates sell product input.
 *
 * @param data - Raw form data
 * @returns ValidationResult with typed SellProductInput
 */
export function validateSellProduct(
  data: unknown,
): ValidationResult<SellProductInput> {
  return validateForm(sellProductSchema, data)
}

/**
 * Validates sell product input with max quantity constraint.
 *
 * @param data - Raw form data
 * @param maxQuantity - Maximum available stock
 * @returns ValidationResult with typed SellProductFormData
 */
export function validateSellProductWithMax(
  data: unknown,
  maxQuantity: number,
): ValidationResult<SellProductFormData> {
  const schema = createSellProductSchema(maxQuantity)
  return validateForm(schema, data)
}

/**
 * Safe parse functions that return undefined on failure.
 */
export function safeParseCreateProduct(
  data: unknown,
): CreateProductInput | undefined {
  const result = createProductSchema.safeParse(data)
  return result.success ? result.data : undefined
}

export function safeParseUpdateProduct(
  data: unknown,
): UpdateProductInput | undefined {
  const result = updateProductSchema.safeParse(data)
  return result.success ? result.data : undefined
}

export function safeParseSellProduct(
  data: unknown,
): SellProductInput | undefined {
  const result = sellProductSchema.safeParse(data)
  return result.success ? result.data : undefined
}