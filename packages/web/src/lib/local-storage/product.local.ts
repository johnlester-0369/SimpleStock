/**
 * Local Product Service
 *
 * localStorage-based product service for demo mode.
 * Implements the same interface as the API product service.
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

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Product interface
 */
export interface LocalProduct {
  id: string
  userId: string
  name: string
  price: number
  stockQuantity: number
  supplier: string
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
 * Create product input
 */
export interface CreateLocalProductData {
  name: string
  price: number
  stockQuantity: number
  supplier: string
}

/**
 * Update product input
 */
export interface UpdateLocalProductData {
  name?: string
  price?: number
  stockQuantity?: number
  supplier?: string
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
 * Query parameters
 */
export interface GetLocalProductsParams {
  search?: string
  stockStatus?: 'all' | 'in-stock' | 'low-stock' | 'out-of-stock'
  supplier?: string
}

// ============================================================================
// CONSTANTS
// ============================================================================

const LOW_STOCK_THRESHOLD = 5
const DEMO_USER_ID = 'demo-user-001'

// ============================================================================
// SEED DATA
// ============================================================================

/**
 * Default products for demo mode
 */
function getDefaultProducts(): LocalProduct[] {
  const now = getCurrentTimestamp()
  return [
    {
      id: generateId(),
      userId: DEMO_USER_ID,
      name: 'Wireless Mouse',
      price: 29.99,
      stockQuantity: 45,
      supplier: 'TechSupply Co',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      userId: DEMO_USER_ID,
      name: 'Mechanical Keyboard',
      price: 89.99,
      stockQuantity: 23,
      supplier: 'TechSupply Co',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      userId: DEMO_USER_ID,
      name: 'USB-C Hub',
      price: 49.99,
      stockQuantity: 3,
      supplier: 'GadgetWorld',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      userId: DEMO_USER_ID,
      name: 'Webcam HD 1080p',
      price: 79.99,
      stockQuantity: 0,
      supplier: 'GadgetWorld',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      userId: DEMO_USER_ID,
      name: 'Monitor Stand',
      price: 34.99,
      stockQuantity: 12,
      supplier: 'Office Essentials',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      userId: DEMO_USER_ID,
      name: 'Desk Lamp LED',
      price: 24.99,
      stockQuantity: 4,
      supplier: 'Office Essentials',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      userId: DEMO_USER_ID,
      name: 'Laptop Stand',
      price: 44.99,
      stockQuantity: 8,
      supplier: 'TechSupply Co',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      userId: DEMO_USER_ID,
      name: 'Bluetooth Speaker',
      price: 59.99,
      stockQuantity: 15,
      supplier: 'GadgetWorld',
      createdAt: now,
      updatedAt: now,
    },
  ]
}

// ============================================================================
// LOCAL PRODUCT SERVICE
// ============================================================================

/**
 * Local product service using localStorage
 */
class LocalProductService {
  /**
   * Initialize storage with seed data if empty
   */
  private initializeIfEmpty(): LocalProduct[] {
    let products = getStorageItem<LocalProduct[]>(STORAGE_KEYS.PRODUCTS, [])
    if (products.length === 0) {
      products = getDefaultProducts()
      setStorageItem(STORAGE_KEYS.PRODUCTS, products)
    }
    return products
  }

  /**
   * Get all products with optional filters
   * @param params - Query parameters for filtering
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

    let products = this.initializeIfEmpty()

    if (params?.search) {
      const searchLower = params.search.toLowerCase()
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.supplier.toLowerCase().includes(searchLower),
      )
    }

    if (params?.stockStatus && params.stockStatus !== 'all') {
      products = products.filter((p) => {
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

    if (params?.supplier) {
      products = products.filter((p) => p.supplier === params.supplier)
    }

    return products
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

    const products = this.initializeIfEmpty()
    const product = products.find((p) => p.id === id)

    if (!product) {
      throw new Error('Product not found')
    }

    return product
  }

  /**
   * Get product statistics
   * @param signal - AbortSignal for request cancellation (unused in local mode)
   */
  async getProductStats(signal?: AbortSignal): Promise<LocalProductStats> {
    // Signal parameter kept for API compatibility
    void signal

    await new Promise((resolve) => setTimeout(resolve, 100))

    const products = this.initializeIfEmpty()

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

    const products = this.initializeIfEmpty()
    let lowStock = products
      .filter((p) => p.stockQuantity < LOW_STOCK_THRESHOLD)
      .sort((a, b) => a.stockQuantity - b.stockQuantity)

    if (limit) {
      lowStock = lowStock.slice(0, limit)
    }

    return { products: lowStock, threshold: LOW_STOCK_THRESHOLD }
  }

  /**
   * Get unique supplier names
   * @param signal - AbortSignal for request cancellation (unused in local mode)
   */
  async getSuppliers(signal?: AbortSignal): Promise<string[]> {
    // Signal parameter kept for API compatibility
    void signal

    await new Promise((resolve) => setTimeout(resolve, 100))

    const products = this.initializeIfEmpty()
    const suppliers = [...new Set(products.map((p) => p.supplier))].sort()

    return suppliers
  }

  /**
   * Create new product
   */
  async createProduct(data: CreateLocalProductData): Promise<LocalProduct> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const products = this.initializeIfEmpty()
    const now = getCurrentTimestamp()

    const newProduct: LocalProduct = {
      id: generateId(),
      userId: DEMO_USER_ID,
      name: data.name,
      price: data.price,
      stockQuantity: data.stockQuantity,
      supplier: data.supplier,
      createdAt: now,
      updatedAt: now,
    }

    products.push(newProduct)
    setStorageItem(STORAGE_KEYS.PRODUCTS, products)

    return newProduct
  }

  /**
   * Update product
   */
  async updateProduct(
    id: string,
    data: UpdateLocalProductData,
  ): Promise<LocalProduct> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const products = this.initializeIfEmpty()
    const index = products.findIndex((p) => p.id === id)

    if (index === -1) {
      throw new Error('Product not found')
    }

    const updatedProduct: LocalProduct = {
      ...products[index],
      ...data,
      updatedAt: getCurrentTimestamp(),
    }

    products[index] = updatedProduct
    setStorageItem(STORAGE_KEYS.PRODUCTS, products)

    return updatedProduct
  }

  /**
   * Sell product (decrement stock and create transaction)
   */
  async sellProduct(
    id: string,
    data: { quantity: number },
  ): Promise<SellLocalProductResponse> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const products = this.initializeIfEmpty()
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
    const updatedProduct: LocalProduct = {
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
      product: updatedProduct,
      sold: data.quantity,
      totalAmount,
    }
  }

  /**
   * Delete product
   */
  async deleteProduct(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const products = this.initializeIfEmpty()
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