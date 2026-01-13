/**
 * Common Validation Schemas and Utilities
 *
 * Reusable Zod schemas and validation helpers for the web application.
 * Uses Zod 4 API with unified error parameter.
 *
 * @module validators/common.validator
 */

import { z, type ZodType, ZodError } from 'zod'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Validation result type for form validation operations.
 * Provides typed success/error states with detailed error information.
 */
export interface ValidationResult<T> {
  /** Whether validation passed */
  success: boolean
  /** Validated and typed data (only present on success) */
  data?: T
  /** First error message (for simple form UX) */
  error?: string
  /** All field-level errors as record */
  errors?: Record<string, string>
}

/**
 * Validation error detail for structured error reporting
 */
export interface ValidationErrorDetail {
  field: string
  message: string
  code: string
}

// ============================================================================
// VALIDATION HELPER FUNCTIONS
// ============================================================================

/**
 * Validates form data against a Zod schema.
 * Returns the first error message for simple form UX.
 *
 * @typeParam S - Zod schema type
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns ValidationResult with success status and either data or error
 *
 * @example
 * ```typescript
 * const result = validateForm(loginSchema, { email: 'test@example.com', password: '123456' })
 * if (result.success) {
 *   console.log(result.data.email)
 * } else {
 *   console.error(result.error)
 * }
 * ```
 */
export function validateForm<S extends ZodType>(
  schema: S,
  data: unknown,
): ValidationResult<z.infer<S>> {
  try {
    const validData = schema.parse(data)
    return { success: true, data: validData }
  } catch (error) {
    if (error instanceof ZodError) {
      const firstIssue = error.issues[0]
      return {
        success: false,
        error: firstIssue?.message ?? 'Validation failed',
        errors: formatZodErrors(error),
      }
    }
    return { success: false, error: 'Validation failed' }
  }
}

/**
 * Formats Zod errors into a record of field -> error message.
 *
 * @param error - ZodError instance
 * @returns Record mapping field paths to error messages
 *
 * @example
 * ```typescript
 * const errors = formatZodErrors(zodError)
 * // { email: 'Invalid email format', password: 'Too short' }
 * ```
 */
export function formatZodErrors(error: ZodError): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const issue of error.issues) {
    const path = issue.path.length > 0 ? issue.path.join('.') : 'root'
    if (!errors[path]) {
      errors[path] = issue.message
    }
  }
  return errors
}

/**
 * Formats Zod errors into detailed error array.
 *
 * @param error - ZodError instance
 * @returns Array of detailed error objects
 */
export function formatZodErrorDetails(error: ZodError): ValidationErrorDetail[] {
  return error.issues.map((issue) => ({
    field: issue.path.length > 0 ? issue.path.join('.') : 'root',
    message: issue.message,
    code: issue.code,
  }))
}

/**
 * Safe parse that returns undefined on failure instead of throwing.
 *
 * @typeParam S - Zod schema type
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validated data or undefined
 *
 * @example
 * ```typescript
 * const user = safeParse(userSchema, formData)
 * if (user) {
 *   // user is typed correctly
 * }
 * ```
 */
export function safeParse<S extends ZodType>(
  schema: S,
  data: unknown,
): z.infer<S> | undefined {
  const result = schema.safeParse(data)
  return result.success ? result.data : undefined
}

// ============================================================================
// SIMPLE VALIDATION HELPERS
// ============================================================================

/**
 * Validates if a string is a valid email address.
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
 * Checks if a string is empty or contains only whitespace.
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

/**
 * Sanitizes a string by trimming whitespace.
 *
 * @param value - String to sanitize
 * @returns Trimmed string
 */
export function sanitize(value: string): string {
  return value.trim()
}

// ============================================================================
// COMMON FIELD SCHEMAS
// ============================================================================

/**
 * Email field schema with validation.
 * Uses Zod 4 top-level email validator.
 */
export const emailSchema = z
  .string({ error: 'Email must be a string' })
  .min(1, { error: 'Email is required' })
  .email({ error: 'Please enter a valid email address' })
  .trim()
  .toLowerCase()

/**
 * Required string field schema factory.
 *
 * @param fieldName - Name of the field for error messages
 * @returns Zod string schema with required validation
 */
export const requiredString = (fieldName: string) =>
  z
    .string({ error: `${fieldName} must be a string` })
    .min(1, { error: `${fieldName} is required` })
    .trim()

/**
 * Optional string field schema.
 */
export const optionalString = z.string().optional().default('')

/**
 * Name field schema (2-100 characters).
 * Used for product names, supplier names, contact persons.
 */
export const nameSchema = z
  .string({ error: 'Name must be a string' })
  .trim()
  .min(2, { error: 'Name must be at least 2 characters' })
  .max(100, { error: 'Name must not exceed 100 characters' })

/**
 * Positive number schema factory.
 * Uses z.coerce.number() to accept numeric strings.
 *
 * @param fieldName - Name of the field for error messages
 * @returns Zod number schema with positive validation
 */
export const positiveNumber = (fieldName: string) =>
  z.coerce
    .number({ error: `${fieldName} must be a number` })
    .refine((val) => !Number.isNaN(val), { error: `${fieldName} must be a valid number` })
    .positive({ error: `${fieldName} must be greater than 0` })

/**
 * Non-negative integer schema factory.
 *
 * @param fieldName - Name of the field for error messages
 * @returns Zod number schema with non-negative integer validation
 */
export const nonNegativeInteger = (fieldName: string) =>
  z.coerce
    .number({ error: `${fieldName} must be a number` })
    .refine((val) => !Number.isNaN(val), { error: `${fieldName} must be a valid number` })
    .int({ error: `${fieldName} must be a whole number` })
    .nonnegative({ error: `${fieldName} must be 0 or more` })

/**
 * Positive integer schema factory.
 *
 * @param fieldName - Name of the field for error messages
 * @returns Zod number schema with positive integer validation
 */
export const positiveInteger = (fieldName: string) =>
  z.coerce
    .number({ error: `${fieldName} must be a number` })
    .refine((val) => !Number.isNaN(val), { error: `${fieldName} must be a valid number` })
    .int({ error: `${fieldName} must be a whole number` })
    .positive({ error: `${fieldName} must be at least 1` })

/**
 * Price schema (minimum $0.01).
 */
export const priceSchema = z.coerce
  .number({ error: 'Price must be a number' })
  .refine((val) => !Number.isNaN(val), { error: 'Price must be a valid number' })
  .min(0.01, { error: 'Price must be at least $0.01' })

/**
 * Stock quantity schema (non-negative integer).
 */
export const stockQuantitySchema = z.coerce
  .number({ error: 'Stock quantity must be a number' })
  .refine((val) => !Number.isNaN(val), { error: 'Stock quantity must be a valid number' })
  .int({ error: 'Stock quantity must be a whole number' })
  .min(0, { error: 'Stock quantity must be 0 or greater' })

/**
 * Sell quantity schema (positive integer).
 */
export const sellQuantitySchema = z.coerce
  .number({ error: 'Quantity must be a number' })
  .refine((val) => !Number.isNaN(val), { error: 'Quantity must be a valid number' })
  .int({ error: 'Quantity must be a whole number' })
  .min(1, { error: 'Quantity must be at least 1' })

/**
 * Phone number schema with basic validation.
 */
export const phoneSchema = z
  .string({ error: 'Phone must be a string' })
  .trim()
  .min(1, { error: 'Phone number is required' })

/**
 * Optional address schema.
 */
export const addressSchema = z
  .string({ error: 'Address must be a string' })
  .trim()
  .optional()
  .default('')

// ============================================================================
// TYPE EXPORTS
// ============================================================================

// Re-export ZodType for external usage
export type { ZodType }