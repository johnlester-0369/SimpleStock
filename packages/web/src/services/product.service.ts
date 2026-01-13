/**
 * Product Service
 *
 * API client for product operations.
 * Communicates with the backend product endpoints.
 *
 * @module services/product.service
 */

import apiClient from '@/lib/api-client'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Product interface matching server response
 */
export interface Product {
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
export interface ProductStats {
  totalProducts: number
  totalUnits: number
  totalValue: number
  lowStockCount: number
  outOfStockCount: number
}

/**
 * Product creation input
 */
export interface CreateProductData {
  name: string
  price: number
  stockQuantity: number
  supplier: string
}

/**
 * Product update input (partial updates allowed)
 */
export interface UpdateProductData {
  name?: string
  price?: number
  stockQuantity?: number
  supplier?: string
}

/**
 * Sell product input
 */
export interface SellProductData {
  quantity: number
}

/**
 * Sell product response
 */
export interface SellProductResponse {
  product: Product
  sold: number
  totalAmount: number
}

/**
 * Query parameters for fetching products
 */
export interface GetProductsParams {
  search?: string
  stockStatus?: 'all' | 'in-stock' | 'low-stock' | 'out-of-stock'
  supplier?: string
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
// SERVICE CLASS
// ============================================================================

/**
 * Product Service - API client for product operations
 */
class ProductService {
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

// Export singleton instance
export const productService = new ProductService()