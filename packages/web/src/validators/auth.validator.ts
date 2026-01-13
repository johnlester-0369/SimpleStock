/**
 * Authentication Validation Schemas
 *
 * Zod schemas for login and password change operations.
 * Provides type-safe validation for authentication forms.
 *
 * @module validators/auth.validator
 */

import { z } from 'zod'
import {
  emailSchema,
  requiredString,
  validateForm,
  type ValidationResult,
} from './common.validator'

// ============================================================================
// LOGIN SCHEMA
// ============================================================================

/**
 * Schema for user login form.
 * Validates email format and requires password.
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string({ error: 'Password must be a string' })
    .min(1, { error: 'Password is required' }),
  rememberMe: z.boolean().optional().default(false),
})

/**
 * Inferred type for login form data
 */
export type LoginFormData = z.infer<typeof loginSchema>

// ============================================================================
// PASSWORD CHANGE SCHEMA
// ============================================================================

/**
 * Schema for password change form.
 * Validates current password, new password requirements,
 * and confirmation match.
 */
export const passwordChangeSchema = z
  .object({
    currentPassword: requiredString('Current password'),
    newPassword: z
      .string({ error: 'New password must be a string' })
      .min(1, { error: 'New password is required' })
      .min(8, { error: 'New password must be at least 8 characters' }),
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

/**
 * Inferred type for password change form data
 */
export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>

// ============================================================================
// USER PROFILE SCHEMA
// ============================================================================

/**
 * Schema for user profile form.
 * Validates name and email fields.
 */
export const userProfileSchema = z.object({
  name: z
    .string({ error: 'Name must be a string' })
    .trim()
    .min(1, { error: 'Full name is required' })
    .min(2, { error: 'Name must be at least 2 characters' }),
  email: emailSchema,
})

/**
 * Inferred type for user profile form data
 */
export type UserProfileFormData = z.infer<typeof userProfileSchema>

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validates login form data.
 *
 * @param data - Raw form data
 * @returns ValidationResult with typed LoginFormData
 *
 * @example
 * ```typescript
 * const result = validateLogin({ email: 'user@example.com', password: 'secret' })
 * if (result.success) {
 *   await login(result.data.email, result.data.password)
 * }
 * ```
 */
export function validateLogin(data: unknown): ValidationResult<LoginFormData> {
  return validateForm(loginSchema, data)
}

/**
 * Validates password change form data.
 *
 * @param data - Raw form data
 * @returns ValidationResult with typed PasswordChangeFormData
 *
 * @example
 * ```typescript
 * const result = validatePasswordChange({
 *   currentPassword: 'old',
 *   newPassword: 'newSecure123',
 *   confirmPassword: 'newSecure123'
 * })
 * ```
 */
export function validatePasswordChange(
  data: unknown,
): ValidationResult<PasswordChangeFormData> {
  return validateForm(passwordChangeSchema, data)
}

/**
 * Validates user profile form data.
 *
 * @param data - Raw form data
 * @returns ValidationResult with typed UserProfileFormData
 */
export function validateUserProfile(
  data: unknown,
): ValidationResult<UserProfileFormData> {
  return validateForm(userProfileSchema, data)
}

/**
 * Safe parse functions that return undefined on failure.
 */
export function safeParseLogin(data: unknown): LoginFormData | undefined {
  const result = loginSchema.safeParse(data)
  return result.success ? result.data : undefined
}

export function safeParsePasswordChange(
  data: unknown,
): PasswordChangeFormData | undefined {
  const result = passwordChangeSchema.safeParse(data)
  return result.success ? result.data : undefined
}