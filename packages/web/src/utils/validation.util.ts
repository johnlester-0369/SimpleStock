import { z, ZodError } from 'zod'

// ============================================================================
// Validation Result Types
// ============================================================================

export interface ValidationResult<T> {
  success: boolean
  data?: T
  error?: string
  errors?: Record<string, string>
}

// ============================================================================
// Validation Helper Functions
// ============================================================================

/**
 * Validates form data against a Zod schema
 * Returns the first error message for simple form UX
 *
 * Generic over the schema S so callers infer the concrete output type.
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns ValidationResult with success status and either data or error
 */
export function validateForm<S extends z.ZodTypeAny>(
  schema: S,
  data: unknown
): ValidationResult<z.infer<S>> {
  try {
    const validData = schema.parse(data)
    return { success: true, data: validData as z.infer<S> }
  } catch (error) {
    if (error instanceof ZodError) {
      const firstIssue = error.issues?.[0]
      return {
        success: false,
        error: firstIssue?.message || 'Validation failed',
        errors: formatZodErrors(error),
      }
    }
    return { success: false, error: 'Validation failed' }
  }
}

/**
 * Formats Zod errors into a record of field -> error message
 *
 * @param error - ZodError instance
 * @returns Record mapping field paths to error messages
 */
export function formatZodErrors(error: ZodError): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const issue of error.issues) {
    const path = issue.path.length ? issue.path.join('.') : 'root'
    if (!errors[path]) {
      errors[path] = issue.message
    }
  }
  return errors
}

/**
 * Safe parse that returns undefined on failure instead of throwing
 *
 * Generic over the schema S so callers infer the concrete output type.
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validated data or undefined
 */
export function safeParse<S extends z.ZodTypeAny>(
  schema: S,
  data: unknown
): z.infer<S> | undefined {
  const result = schema.safeParse(data)
  return result.success ? (result.data as z.infer<S>) : undefined
}

// ============================================================================
// Simple Validation Helper Functions
// ============================================================================

/**
 * Validates if a string is a valid email address
 *
 * @param email - String to validate
 * @returns True if valid email format, false otherwise
 *
 * @example
 * ```typescript
 * isValidEmail('user@example.com') // true
 * isValidEmail('invalid-email') // false
 * ```
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Checks if a string is empty or contains only whitespace
 *
 * @param value - String to check
 * @returns True if empty or whitespace only, false otherwise
 *
 * @example
 * ```typescript
 * isEmpty('') // true
 * isEmpty('   ') // true
 * isEmpty('hello') // false
 * ```
 */
export function isEmpty(value: string): boolean {
  return value.trim().length === 0
}

// ============================================================================
// Common Field Schemas (Reusable)
// ============================================================================

/**
 * Email field schema with custom error message
 */
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')

/**
 * Required string field schema factory
 */
export const requiredString = (fieldName: string) =>
  z.string().min(1, `${fieldName} is required`)

/**
 * Optional string field schema
 */
export const optionalString = z.string().optional().default('')

/**
 * Positive number schema factory
 *
 * Uses z.coerce.number() to accept numeric strings, but ensures the result
 * is a real number (not NaN) and then enforces positivity.
 */
export const positiveNumber = (fieldName: string) =>
  z
    .coerce
    .number()
    .refine((val) => !Number.isNaN(val), `${fieldName} must be a valid number`)
    .positive(`${fieldName} must be greater than 0`)

/**
 * Non-negative integer schema factory
 *
 * Coerces string input to number, validates it's a number, then checks int & nonnegative.
 */
export const nonNegativeInteger = (fieldName: string) =>
  z
    .coerce
    .number()
    .refine((val) => !Number.isNaN(val), `${fieldName} must be a valid number`)
    .int(`${fieldName} must be a whole number`)
    .nonnegative(`${fieldName} must be 0 or more`)

/**
 * Positive integer schema factory
 */
export const positiveInteger = (fieldName: string) =>
  z
    .coerce
    .number()
    .refine((val) => !Number.isNaN(val), `${fieldName} must be a valid number`)
    .int(`${fieldName} must be a whole number`)
    .positive(`${fieldName} must be at least 1`)

// ============================================================================
// Login Schema
// ============================================================================

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

export type LoginFormData = z.infer<typeof loginSchema>

// ============================================================================
// Product Schemas
// ============================================================================

export const productSchema = z.object({
  name: requiredString('Product name'),
  price: positiveNumber('Price'),
  stockQuantity: nonNegativeInteger('Stock quantity'),
  supplier: requiredString('Supplier').refine(
    (val) => val.trim().length > 0,
    'Please select a supplier'
  ),
})

export type ProductFormData = z.infer<typeof productSchema>

/**
 * Create a sell product schema with dynamic max quantity
 *
 * @param maxQuantity - Maximum available stock quantity
 * @returns Zod schema for sell form validation
 */
export const createSellProductSchema = (maxQuantity: number) =>
  z.object({
    quantity: positiveInteger('Quantity').refine(
      (val) => val <= maxQuantity,
      `Insufficient stock. Only ${maxQuantity} available.`
    ),
  })

export type SellProductFormData = z.infer<
  ReturnType<typeof createSellProductSchema>
>

// ============================================================================
// User Profile Schemas
// ============================================================================

export const userProfileSchema = z.object({
  name: requiredString('Full name'),
  email: emailSchema,
})

export type UserProfileFormData = z.infer<typeof userProfileSchema>

// ============================================================================
// Password Change Schema
// ============================================================================

export const passwordChangeSchema = z
  .object({
    currentPassword: requiredString('Current password'),
    newPassword: z
      .string()
      .min(1, 'New password is required')
      .min(8, 'New password must be at least 8 characters'),
    confirmPassword: requiredString('Confirm password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'New passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  })

export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>

// ============================================================================
// Supplier Schema
// ============================================================================

export const supplierSchema = z.object({
  name: requiredString('Supplier name'),
  contactPerson: requiredString('Contact person'),
  email: emailSchema,
  phone: requiredString('Phone number'),
  address: z.string().optional().default(''),
})

export type SupplierFormData = z.infer<typeof supplierSchema>

// ============================================================================
// Utility Type Exports
// ============================================================================

// Re-export the Zod base type if other modules expect it (non-deprecated)
export type { ZodType } from 'zod'