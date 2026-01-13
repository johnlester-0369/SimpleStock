/**
 * Validators Module Barrel Export
 *
 * Centralized exports for all Zod validation schemas and functions.
 * Import validators from this module for consistent usage.
 *
 * @module validators
 *
 * @example
 * ```typescript
 * import {
 *   validateCreateProduct,
 *   createProductSchema,
 *   isEmpty,
 *   isValidEmail,
 *   type CreateProductInput,
 * } from '@/validators'
 * ```
 */

// ============================================================================
// COMMON VALIDATORS
// ============================================================================

export {
  // Types
  type ValidationResult,
  type ValidationErrorDetail,
  type ZodType,
  // Helper Functions
  validateForm,
  formatZodErrors,
  formatZodErrorDetails,
  safeParse,
  isValidEmail,
  isEmpty,
  sanitize,
  // Common Schemas
  emailSchema,
  requiredString,
  optionalString,
  nameSchema,
  positiveNumber,
  nonNegativeInteger,
  positiveInteger,
  priceSchema,
  stockQuantitySchema,
  sellQuantitySchema,
  phoneSchema,
  addressSchema,
} from './common.validator'

// ============================================================================
// AUTH VALIDATORS
// ============================================================================

export {
  // Schemas
  loginSchema,
  passwordChangeSchema,
  userProfileSchema,
  // Types
  type LoginFormData,
  type PasswordChangeFormData,
  type UserProfileFormData,
  // Functions
  validateLogin,
  validatePasswordChange,
  validateUserProfile,
  safeParseLogin,
  safeParsePasswordChange,
} from './auth.validator'

// ============================================================================
// PRODUCT VALIDATORS
// ============================================================================

export {
  // Schemas
  createProductSchema,
  updateProductSchema,
  sellProductSchema,
  createSellProductSchema,
  // Types
  type CreateProductInput,
  type UpdateProductInput,
  type SellProductInput,
  type SellProductFormData,
  // Functions
  validateCreateProduct,
  validateUpdateProduct,
  validateSellProduct,
  validateSellProductWithMax,
  safeParseCreateProduct,
  safeParseUpdateProduct,
  safeParseSellProduct,
} from './product.validator'

// ============================================================================
// SUPPLIER VALIDATORS
// ============================================================================

export {
  // Schemas
  createSupplierSchema,
  updateSupplierSchema,
  // Types
  type CreateSupplierInput,
  type UpdateSupplierInput,
  // Functions
  validateCreateSupplier,
  validateUpdateSupplier,
  safeParseCreateSupplier,
  safeParseUpdateSupplier,
} from './supplier.validator'