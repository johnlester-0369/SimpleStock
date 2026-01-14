/**
 * Product Service
 *
 * Exports the appropriate product service based on environment.
 * - API mode: Uses HTTP client for backend communication
 * - Demo mode: Uses localStorage for offline demo
 *
 * @module services/product.service
 */

import { getDataSource } from '@/lib/data-source'
import apiClient from '@/lib/api-client'
import {
  localProductService,
  type LocalProduct,
  type LocalProductStats,
  type CreateLocalProductData,
  type UpdateLocalProductData,
  type SellLocalProductResponse,
  type GetLocalProductsParams,
} from '@/lib/local-storage'

// ============================================================================
// TYPE DEFINITIONS (Re-export for consumers)
// ============================================================================

/**
 * Product interface matching server response
 */
export type Product = LocalProduct

/**
 * Product statistics
 */
export type ProductStats = LocalProductStats

/**
 * Product creation input
 */
export type CreateProductData = CreateLocalProductData

/**
 * Product update input (partial updates allowed)
 */
export type UpdateProductData = UpdateLocalProductData

/**
 * Sell product input
 */
export interface SellProductData {
  quantity: number
}

/**
 * Sell product response
 */
export type SellProductResponse = SellLocalProductResponse

/**
 * Query parameters for fetching products
 */
export type GetProductsParams = GetLocalProductsParams & {
  [key: string]: string | undefined
}

/**
 * Low stock response
 */
export interface LowStockResponse {
  products: Product[]
  threshold: number
}

// ============================================================================
// API SERVICE CLASS
// ============================================================================

/**
 * API Product Service - HTTP client for product operations
 */
class ApiProductService {
  private readonly baseUrl = '/api/v1/admin/products'

  /**
   * Get all products with optional filters
   */
  async getProducts(
    params?: GetProductsParams,
    signal?: AbortSignal,
  ): Promise<Product[]> {
    try {
      const response = await apiClient.get<{ products: Product[] }>(
        this.baseUrl,
        { params, signal },
      )
      return response.data.products
    } catch (error) {
      console.error('Failed to fetch products:', error)
      throw error
    }
  }

  /**
   * Get single product by ID
   */
  async getProductById(id: string, signal?: AbortSignal): Promise<Product> {
    try {
      const response = await apiClient.get<Product>(`${this.baseUrl}/${id}`, {
        signal,
      })
      return response.data
    } catch (error) {
      console.error('Failed to fetch product:', error)
      throw error
    }
  }

  /**
   * Get product statistics
   */
  async getProductStats(signal?: AbortSignal): Promise<ProductStats> {
    try {
      const response = await apiClient.get<ProductStats>(
        `${this.baseUrl}/stats`,
        { signal },
      )
      return response.data
    } catch (error) {
      console.error('Failed to fetch product stats:', error)
      throw error
    }
  }

  /**
   * Get low stock products
   */
  async getLowStockProducts(
    limit?: number,
    signal?: AbortSignal,
  ): Promise<LowStockResponse> {
    try {
      const params = limit ? { limit: String(limit) } : undefined
      const response = await apiClient.get<LowStockResponse>(
        `${this.baseUrl}/low-stock`,
        { params, signal },
      )
      return response.data
    } catch (error) {
      console.error('Failed to fetch low stock products:', error)
      throw error
    }
  }

  /**
   * Get unique supplier names from products
   */
  async getSuppliers(signal?: AbortSignal): Promise<string[]> {
    try {
      const response = await apiClient.get<{ suppliers: string[] }>(
        `${this.baseUrl}/suppliers`,
        { signal },
      )
      return response.data.suppliers
    } catch (error) {
      console.error('Failed to fetch suppliers:', error)
      throw error
    }
  }

  /**
   * Create new product
   */
  async createProduct(data: CreateProductData): Promise<Product> {
    try {
      const response = await apiClient.post<Product>(this.baseUrl, data)
      return response.data
    } catch (error) {
      console.error('Failed to create product:', error)
      throw error
    }
  }

  /**
   * Update product
   */
  async updateProduct(id: string, data: UpdateProductData): Promise<Product> {
    try {
      const response = await apiClient.put<Product>(
        `${this.baseUrl}/${id}`,
        data,
      )
      return response.data
    } catch (error) {
      console.error('Failed to update product:', error)
      throw error
    }
  }

  /**
   * Sell product (decrement stock)
   */
  async sellProduct(id: string, data: SellProductData): Promise<SellProductResponse> {
    try {
      const response = await apiClient.post<SellProductResponse>(
        `${this.baseUrl}/${id}/sell`,
        data,
      )
      return response.data
    } catch (error) {
      console.error('Failed to sell product:', error)
      throw error
    }
  }

  /**
   * Delete product
   */
  async deleteProduct(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`)
    } catch (error) {
      console.error('Failed to delete product:', error)
      throw error
    }
  }
}

// ============================================================================
// SERVICE EXPORT
// ============================================================================

/** API service instance */
const apiProductService = new ApiProductService()

/**
 * Product service - automatically uses correct implementation based on environment.
 *
 * In demo mode (VITE_DATA_SOURCE=local), uses localStorage.
 * In API mode (VITE_DATA_SOURCE=api), uses HTTP backend.
 */
export const productService = getDataSource() === 'local'
  ? localProductService
  : apiProductService