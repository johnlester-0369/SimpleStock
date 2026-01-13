/**
 * Supplier Validation Schemas
 *
 * Zod schemas for supplier-related operations including
 * creation, updates, and filtering.
 *
 * @module validators/supplier.validator
 */

import { z } from 'zod';
import {
  nameSchema,
  emailSchema,
  phoneSchema,
  addressSchema,
  searchQuerySchema,
  objectIdSchema,
} from './common.validator.js';

// ============================================================================
// CREATE SUPPLIER SCHEMA
// ============================================================================

/**
 * Schema for creating a new supplier.
 * Required: name, contactPerson, email, phone
 * Optional: address
 */
export const createSupplierSchema = z.object({
  name: nameSchema,
  contactPerson: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  address: addressSchema,
});

/**
 * Inferred type for supplier creation input
 */
export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;

// ============================================================================
// UPDATE SUPPLIER SCHEMA
// ============================================================================

/**
 * Schema for updating an existing supplier.
 * All fields optional, but validated if provided.
 */
export const updateSupplierSchema = z.object({
  name: z
    .string({ error: 'Name must be a string' })
    .trim()
    .min(2, { error: 'Name must be at least 2 characters' })
    .max(100, { error: 'Name must not exceed 100 characters' })
    .optional(),
  contactPerson: z
    .string({ error: 'Contact person must be a string' })
    .trim()
    .min(2, { error: 'Contact person must be at least 2 characters' })
    .max(100, { error: 'Contact person must not exceed 100 characters' })
    .optional(),
  email: z
    .email({ error: 'Invalid email format' })
    .trim()
    .toLowerCase()
    .optional(),
  phone: z
    .string({ error: 'Phone must be a string' })
    .trim()
    .min(1, { error: 'Phone cannot be empty' })
    .optional(),
  address: z
    .string({ error: 'Address must be a string' })
    .trim()
    .optional(),
});

/**
 * Inferred type for supplier update input
 */
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;

// ============================================================================
// FILTER SCHEMAS
// ============================================================================

/**
 * Schema for supplier list query parameters.
 */
export const supplierFilterSchema = z.object({
  search: searchQuerySchema,
});

/**
 * Inferred type for supplier filters
 */
export type SupplierFilterInput = z.infer<typeof supplierFilterSchema>;

/**
 * Schema for supplier ID parameter.
 */
export const supplierIdParamSchema = z.object({
  id: objectIdSchema,
});

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validates supplier creation input.
 *
 * @param input - Raw input data
 * @returns Validated and typed input
 * @throws {z.ZodError} If validation fails
 *
 * @example
 * ```typescript
 * const validated = validateCreateSupplier({
 *   name: 'TechCorp',
 *   contactPerson: 'John Doe',
 *   email: 'john@techcorp.com',
 *   phone: '+1-555-0123',
 *   address: '123 Tech Lane'
 * });
 * ```
 */
export function validateCreateSupplier(input: unknown): CreateSupplierInput {
  return createSupplierSchema.parse(input);
}

/**
 * Validates supplier update input.
 *
 * @param input - Raw input data
 * @returns Validated and typed input
 * @throws {z.ZodError} If validation fails
 */
export function validateUpdateSupplier(input: unknown): UpdateSupplierInput {
  return updateSupplierSchema.parse(input);
}

/**
 * Validates supplier filter query parameters.
 *
 * @param input - Raw query parameters
 * @returns Validated and typed filters
 * @throws {z.ZodError} If validation fails
 */
export function validateSupplierFilter(input: unknown): SupplierFilterInput {
  return supplierFilterSchema.parse(input);
}

/**
 * Safe validation that returns result object instead of throwing.
 */
export function safeValidateCreateSupplier(input: unknown) {
  return createSupplierSchema.safeParse(input);
}

export function safeValidateUpdateSupplier(input: unknown) {
  return updateSupplierSchema.safeParse(input);
}