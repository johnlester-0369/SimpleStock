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
 *   type CreateProductInput,
 * } from '@/validators/index.js';
 * ```
 */

// ============================================================================
// COMMON VALIDATORS
// ============================================================================

export {
  // Schemas
  objectIdSchema,
  nonEmptyStringSchema,
  nameSchema,
  optionalNameSchema,
  priceSchema,
  stockQuantitySchema,
  sellQuantitySchema,
  limitSchema,
  isoDateStringSchema,
  optionalIsoDateStringSchema,
  emailSchema,
  phoneSchema,
  addressSchema,
  searchQuerySchema,
  stockStatusSchema,
  periodSchema,
  // Types
  type ObjectId,
  type StockStatus,
  type TransactionPeriod,
} from './common.validator.js';

// ============================================================================
// PRODUCT VALIDATORS
// ============================================================================

export {
  // Schemas
  createProductSchema,
  updateProductSchema,
  sellProductSchema,
  productFilterSchema,
  productIdParamSchema,
  lowStockQuerySchema,
  // Types
  type CreateProductInput,
  type UpdateProductInput,
  type SellProductInput,
  type ProductFilterInput,
  // Functions
  validateCreateProduct,
  validateUpdateProduct,
  validateSellProduct,
  validateProductFilter,
  safeValidateCreateProduct,
  safeValidateUpdateProduct,
  safeValidateSellProduct,
} from './product.validator.js';

// ============================================================================
// SUPPLIER VALIDATORS
// ============================================================================

export {
  // Schemas
  createSupplierSchema,
  updateSupplierSchema,
  supplierFilterSchema,
  supplierIdParamSchema,
  // Types
  type CreateSupplierInput,
  type UpdateSupplierInput,
  type SupplierFilterInput,
  // Functions
  validateCreateSupplier,
  validateUpdateSupplier,
  validateSupplierFilter,
  safeValidateCreateSupplier,
  safeValidateUpdateSupplier,
} from './supplier.validator.js';

// ============================================================================
// TRANSACTION VALIDATORS
// ============================================================================

export {
  // Schemas
  transactionFilterSchema,
  transactionIdParamSchema,
  transactionStatsQuerySchema,
  dailySalesQuerySchema,
  recentTransactionsQuerySchema,
  // Types
  type TransactionFilterInput,
  type TransactionStatsInput,
  type DailySalesInput,
  type RecentTransactionsInput,
  // Functions
  validateTransactionFilter,
  validateTransactionStats,
  validateDailySales,
  validateRecentTransactions,
  safeValidateTransactionFilter,
  safeValidateTransactionStats,
} from './transaction.validator.js';