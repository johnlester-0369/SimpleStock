/**
 * Local Product Service
 *
 * localStorage-based product service for demo mode.
 * Implements the same interface as the API product service.
 * Now uses supplierId reference instead of supplier string.
 *
 * @module lib/local-storage/product.local
 */

import {
  STORAGE_KEYS,
  getStorageItem,
  setStorageItem,
  generateId,
  getCurrentTimestamp,
} from './storage.util'
import { localTransactionService } from './transaction.local'
import { localSupplierService } from './supplier.local'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Product interface - now includes supplierId and supplierName
 */
export interface LocalProduct {
  id: string
  userId: string
  name: string
  price: number
  stockQuantity: number
  supplierId: string
  supplierName: string
  createdAt: string
  updatedAt: string
}

/**
 * Product statistics
 */
export interface LocalProductStats {
  totalProducts: number
  totalUnits: number
  totalValue: number
  lowStockCount: number
  outOfStockCount: number
}

/**
 * Create product input - uses supplierId
 */
export interface CreateLocalProductData {
  name: string
  price: number
  stockQuantity: number
  supplierId: string
}

/**
 * Update product input - uses supplierId
 */
export interface UpdateLocalProductData {
  name?: string
  price?: number
  stockQuantity?: number
  supplierId?: string
}

/**
 * Sell product response
 */
export interface SellLocalProductResponse {
  product: LocalProduct
  sold: number
  totalAmount: number
}

/**
 * Query parameters - uses supplierId for filtering
 */
export interface GetLocalProductsParams {
  search?: string
  stockStatus?: 'all' | 'in-stock' | 'low-stock' | 'out-of-stock'
  supplierId?: string
}

/**
 * Internal product storage format (without supplierName)
 */
interface StoredProduct {
  id: string
  userId: string
  name: string
  price: number
  stockQuantity: number
  supplierId: string
  createdAt: string
  updatedAt: string
}

// ============================================================================
// CONSTANTS
// ============================================================================

const LOW_STOCK_THRESHOLD = 5
const DEMO_USER_ID = 'demo-user-001'

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get supplier name by ID from suppliers list
 */
async function getSupplierName(supplierId: string): Promise<string> {
  try {
    const supplier = await localSupplierService.getSupplierById(supplierId)
    return supplier.name
  } catch {
    return 'Unknown Supplier'
  }
}

/**
 * Populate supplier name for a stored product
 */
async function populateProduct(stored: StoredProduct): Promise<LocalProduct> {
  const supplierName = await getSupplierName(stored.supplierId)
  return {
    ...stored,
    supplierName,
  }
}

/**
 * Populate supplier names for multiple stored products
 */
async function populateProducts(stored: StoredProduct[]): Promise<LocalProduct[]> {
  // Get all suppliers once for efficiency
  const suppliers = await localSupplierService.getSuppliers()
  const supplierMap = new Map(suppliers.map((s) => [s.id, s.name]))

  return stored.map((p) => ({
    ...p,
    supplierName: supplierMap.get(p.supplierId) ?? 'Unknown Supplier',
  }))
}

// ============================================================================
// SEED DATA
// ============================================================================

/**
 * Default products for demo mode - now uses supplierId
 */
async function getDefaultProducts(): Promise<StoredProduct[]> {
  const now = getCurrentTimestamp()

  // Get suppliers to use their IDs
  const suppliers = await localSupplierService.getSuppliers()
  const techSupply = suppliers.find((s) => s.name === 'TechSupply Co')
  const gadgetWorld = suppliers.find((s) => s.name === 'GadgetWorld')
  const officeEssentials = suppliers.find((s) => s.name === 'Office Essentials')

  // Fallback supplier ID if not found
  const defaultSupplierId = suppliers[0]?.id ?? generateId()

  return [
    {
      id: generateId(),
      userId: DEMO_USER_ID,
      name: 'Wireless Mouse',
      price: 29.99,
      stockQuantity: 45,
      supplierId: techSupply?.id ?? defaultSupplierId,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      userId: DEMO_USER_ID,
      name: 'Mechanical Keyboard',
      price: 89.99,
      stockQuantity: 23,
      supplierId: techSupply?.id ?? defaultSupplierId,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      userId: DEMO_USER_ID,
      name: 'USB-C Hub',
      price: 49.99,
      stockQuantity: 3,
      supplierId: gadgetWorld?.id ?? defaultSupplierId,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      userId: DEMO_USER_ID,
      name: 'Webcam HD 1080p',
      price: 79.99,
      stockQuantity: 0,
      supplierId: gadgetWorld?.id ?? defaultSupplierId,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      userId: DEMO_USER_ID,
      name: 'Monitor Stand',
      price: 34.99,
      stockQuantity: 12,
      supplierId: officeEssentials?.id ?? defaultSupplierId,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      userId: DEMO_USER_ID,
      name: 'Desk Lamp LED',
      price: 24.99,
      stockQuantity: 4,
      supplierId: officeEssentials?.id ?? defaultSupplierId,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      userId: DEMO_USER_ID,
      name: 'Laptop Stand',
      price: 44.99,
      stockQuantity: 8,
      supplierId: techSupply?.id ?? defaultSupplierId,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      userId: DEMO_USER_ID,
      name: 'Bluetooth Speaker',
      price: 59.99,
      stockQuantity: 15,
      supplierId: gadgetWorld?.id ?? defaultSupplierId,
      createdAt: now,
      updatedAt: now,
    },
  ]
}

// ============================================================================
// LOCAL PRODUCT SERVICE
// ============================================================================

/**
 * Local product service using localStorage.
 * Now uses supplierId reference instead of supplier name.
 */
class LocalProductService {
  /**
   * Initialize storage with seed data if empty
   */
  private async initializeIfEmpty(): Promise<StoredProduct[]> {
    let products = getStorageItem<StoredProduct[]>(STORAGE_KEYS.PRODUCTS, [])
    if (products.length === 0) {
      // Ensure suppliers are initialized first
      await localSupplierService.getSuppliers()
      products = await getDefaultProducts()
      setStorageItem(STORAGE_KEYS.PRODUCTS, products)
    }
    return products
  }

  /**
   * Get all products with optional filters
   * @param params - Query parameters for filtering (uses supplierId)
   * @param signal - AbortSignal for request cancellation (unused in local mode)
   */
  async getProducts(
    params?: GetLocalProductsParams,
    signal?: AbortSignal,
  ): Promise<LocalProduct[]> {
    // Signal parameter kept for API compatibility
    void signal

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 200))

    let storedProducts = await this.initializeIfEmpty()

    if (params?.search) {
      const searchLower = params.search.toLowerCase()
      // Need to populate to search by supplier name
      const populated = await populateProducts(storedProducts)
      storedProducts = storedProducts.filter((p, i) =>
        p.name.toLowerCase().includes(searchLower) ||
        populated[i].supplierName.toLowerCase().includes(searchLower),
      )
    }

    if (params?.stockStatus && params.stockStatus !== 'all') {
      storedProducts = storedProducts.filter((p) => {
        switch (params.stockStatus) {
          case 'in-stock':
            return p.stockQuantity >= LOW_STOCK_THRESHOLD
          case 'low-stock':
            return p.stockQuantity > 0 && p.stockQuantity < LOW_STOCK_THRESHOLD
          case 'out-of-stock':
            return p.stockQuantity === 0
          default:
            return true
        }
      })
    }

    // Filter by supplierId
    if (params?.supplierId) {
      storedProducts = storedProducts.filter((p) => p.supplierId === params.supplierId)
    }

    return populateProducts(storedProducts)
  }

  /**
   * Get single product by ID
   * @param id - Product ID
   * @param signal - AbortSignal for request cancellation (unused in local mode)
   */
  async getProductById(id: string, signal?: AbortSignal): Promise<LocalProduct> {
    // Signal parameter kept for API compatibility
    void signal

    await new Promise((resolve) => setTimeout(resolve, 100))

    const products = await this.initializeIfEmpty()
    const product = products.find((p) => p.id === id)

    if (!product) {
      throw new Error('Product not found')
    }

    return populateProduct(product)
  }

  /**
   * Get product statistics
   * @param signal - AbortSignal for request cancellation (unused in local mode)
   */
  async getProductStats(signal?: AbortSignal): Promise<LocalProductStats> {
    // Signal parameter kept for API compatibility
    void signal

    await new Promise((resolve) => setTimeout(resolve, 100))

    const products = await this.initializeIfEmpty()

    return {
      totalProducts: products.length,
      totalUnits: products.reduce((sum, p) => sum + p.stockQuantity, 0),
      totalValue: products.reduce(
        (sum, p) => sum + p.price * p.stockQuantity,
        0,
      ),
      lowStockCount: products.filter(
        (p) => p.stockQuantity > 0 && p.stockQuantity < LOW_STOCK_THRESHOLD,
      ).length,
      outOfStockCount: products.filter((p) => p.stockQuantity === 0).length,
    }
  }

  /**
   * Get low stock products
   * @param limit - Maximum number of products to return
   * @param signal - AbortSignal for request cancellation (unused in local mode)
   */
  async getLowStockProducts(
    limit?: number,
    signal?: AbortSignal,
  ): Promise<{ products: LocalProduct[]; threshold: number }> {
    // Signal parameter kept for API compatibility
    void signal

    await new Promise((resolve) => setTimeout(resolve, 100))

    const products = await this.initializeIfEmpty()
    let lowStock = products
      .filter((p) => p.stockQuantity < LOW_STOCK_THRESHOLD)
      .sort((a, b) => a.stockQuantity - b.stockQuantity)

    if (limit) {
      lowStock = lowStock.slice(0, limit)
    }

    return {
      products: await populateProducts(lowStock),
      threshold: LOW_STOCK_THRESHOLD,
    }
  }

  /**
   * Get unique supplier IDs from products.
   * @deprecated Use supplierService.getSuppliers() instead for full supplier data
   * @param signal - AbortSignal for request cancellation (unused in local mode)
   */
  async getSuppliers(signal?: AbortSignal): Promise<string[]> {
    // Signal parameter kept for API compatibility
    void signal

    await new Promise((resolve) => setTimeout(resolve, 100))

    const products = await this.initializeIfEmpty()
    const supplierIds = [...new Set(products.map((p) => p.supplierId))]

    return supplierIds
  }

  /**
   * Create new product - uses supplierId
   */
  async createProduct(data: CreateLocalProductData): Promise<LocalProduct> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Validate supplier exists
    try {
      await localSupplierService.getSupplierById(data.supplierId)
    } catch {
      throw new Error('Supplier not found')
    }

    const products = await this.initializeIfEmpty()
    const now = getCurrentTimestamp()

    const newProduct: StoredProduct = {
      id: generateId(),
      userId: DEMO_USER_ID,
      name: data.name,
      price: data.price,
      stockQuantity: data.stockQuantity,
      supplierId: data.supplierId,
      createdAt: now,
      updatedAt: now,
    }

    products.push(newProduct)
    setStorageItem(STORAGE_KEYS.PRODUCTS, products)

    return populateProduct(newProduct)
  }

  /**
   * Update product - uses supplierId
   */
  async updateProduct(
    id: string,
    data: UpdateLocalProductData,
  ): Promise<LocalProduct> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Validate supplier exists if updating
    if (data.supplierId) {
      try {
        await localSupplierService.getSupplierById(data.supplierId)
      } catch {
        throw new Error('Supplier not found')
      }
    }

    const products = await this.initializeIfEmpty()
    const index = products.findIndex((p) => p.id === id)

    if (index === -1) {
      throw new Error('Product not found')
    }

    const updatedProduct: StoredProduct = {
      ...products[index],
      ...data,
      updatedAt: getCurrentTimestamp(),
    }

    products[index] = updatedProduct
    setStorageItem(STORAGE_KEYS.PRODUCTS, products)

    return populateProduct(updatedProduct)
  }

  /**
   * Sell product (decrement stock and create transaction)
   */
  async sellProduct(
    id: string,
    data: { quantity: number },
  ): Promise<SellLocalProductResponse> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const products = await this.initializeIfEmpty()
    const index = products.findIndex((p) => p.id === id)

    if (index === -1) {
      throw new Error('Product not found')
    }

    const product = products[index]

    if (product.stockQuantity < data.quantity) {
      throw new Error(
        `Insufficient stock. Only ${product.stockQuantity} available.`,
      )
    }

    // Update stock
    const updatedProduct: StoredProduct = {
      ...product,
      stockQuantity: product.stockQuantity - data.quantity,
      updatedAt: getCurrentTimestamp(),
    }

    products[index] = updatedProduct
    setStorageItem(STORAGE_KEYS.PRODUCTS, products)

    // Create transaction
    const totalAmount = product.price * data.quantity
    await localTransactionService.createTransaction({
      productId: product.id,
      productName: product.name,
      quantity: data.quantity,
      unitPrice: product.price,
      totalAmount,
    })

    return {
      product: await populateProduct(updatedProduct),
      sold: data.quantity,
      totalAmount,
    }
  }

  /**
   * Delete product
   */
  async deleteProduct(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const products = await this.initializeIfEmpty()
    const index = products.findIndex((p) => p.id === id)

    if (index === -1) {
      throw new Error('Product not found')
    }

    products.splice(index, 1)
    setStorageItem(STORAGE_KEYS.PRODUCTS, products)
  }
}

/** Singleton instance */
export const localProductService = new LocalProductService()