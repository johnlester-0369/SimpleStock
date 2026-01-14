/**
 * Local Storage Module Barrel Export
 *
 * Re-exports all local storage services and utilities
 * for demo mode functionality.
 *
 * @module lib/local-storage
 */

// Storage utilities
export {
  STORAGE_KEYS,
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  clearDemoStorage,
  generateId,
  getCurrentTimestamp,
} from './storage.util'

// Auth
export {
  localAuthClient,
  DEMO_CREDENTIALS,
} from './auth.local'

// Product service
export {
  localProductService,
  type LocalProduct,
  type LocalProductStats,
  type CreateLocalProductData,
  type UpdateLocalProductData,
  type SellLocalProductResponse,
  type GetLocalProductsParams,
} from './product.local'

// Supplier service
export {
  localSupplierService,
  type LocalSupplier,
  type CreateLocalSupplierData,
  type UpdateLocalSupplierData,
  type GetLocalSuppliersParams,
} from './supplier.local'

// Transaction service
export {
  localTransactionService,
  type LocalTransaction,
  type LocalTransactionStats,
  type LocalDailySales,
  type LocalDailySalesResponse,
  type GetLocalTransactionsParams,
} from './transaction.local'