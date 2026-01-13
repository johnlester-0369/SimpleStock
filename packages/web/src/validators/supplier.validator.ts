/**
 * Supplier Validation Schemas
 *
 * Zod schemas for supplier CRUD operations including
 * creation and updates.
 *
 * @module validators/supplier.validator
 */

import { z } from 'zod'
import {
  nameSchema,
  emailSchema,
  phoneSchema,
  addressSchema,
  validateForm,
  type ValidationResult,
} from './common.validator'

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
})

/**
 * Inferred type for supplier creation input
 */
export type CreateSupplierInput = z.infer<typeof createSupplierSchema>

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
    .string({ error: 'Email must be a string' })
    .email({ error: 'Invalid email format' })
    .trim()
    .toLowerCase()
    .optional(),
  phone: z
    .string({ error: 'Phone must be a string' })
    .trim()
    .min(1, { error: 'Phone cannot be empty' })
    .optional(),
  address: z.string({ error: 'Address must be a string' }).trim().optional(),
})

/**
 * Inferred type for supplier update input
 */
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validates supplier creation input.
 *
 * @param data - Raw form data
 * @returns ValidationResult with typed CreateSupplierInput
 *
 * @example
 * ```typescript
 * const result = validateCreateSupplier({
 *   name: 'TechCorp',
 *   contactPerson: 'John Doe',
 *   email: 'john@techcorp.com',
 *   phone: '+1-555-0123',
 *   address: '123 Tech Lane'
 * })
 * ```
 */
export function validateCreateSupplier(
  data: unknown,
): ValidationResult<CreateSupplierInput> {
  return validateForm(createSupplierSchema, data)
}

/**
 * Validates supplier update input.
 *
 * @param data - Raw form data
 * @returns ValidationResult with typed UpdateSupplierInput
 */
export function validateUpdateSupplier(
  data: unknown,
): ValidationResult<UpdateSupplierInput> {
  return validateForm(updateSupplierSchema, data)
}

/**
 * Safe parse functions that return undefined on failure.
 */
export function safeParseCreateSupplier(
  data: unknown,
): CreateSupplierInput | undefined {
  const result = createSupplierSchema.safeParse(data)
  return result.success ? result.data : undefined
}

export function safeParseUpdateSupplier(
  data: unknown,
): UpdateSupplierInput | undefined {
  const result = updateSupplierSchema.safeParse(data)
  return result.success ? result.data : undefined
}