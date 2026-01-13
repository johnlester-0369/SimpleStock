/**
 * Supplier Service
 *
 * API client for supplier operations.
 * Communicates with the backend supplier endpoints.
 *
 * @module services/supplier.service
 */

import apiClient from '@/lib/api-client'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Supplier interface matching server response
 */
export interface Supplier {
  id: string
  userId: string
  name: string
  contactPerson: string
  email: string
  phone: string
  address: string
  createdAt: string
  updatedAt: string
}

/**
 * Supplier creation input
 */
export interface CreateSupplierData {
  name: string
  contactPerson: string
  email: string
  phone: string
  address?: string
}

/**
 * Supplier update input (partial updates allowed)
 */
export interface UpdateSupplierData {
  name?: string
  contactPerson?: string
  email?: string
  phone?: string
  address?: string
}

/**
 * Query parameters for fetching suppliers
 */
export interface GetSuppliersParams {
  search?: string
  [key: string]: string | undefined
}

// ============================================================================
// SERVICE CLASS
// ============================================================================

/**
 * Supplier Service - API client for supplier operations
 */
class SupplierService {
  private readonly baseUrl = '/api/v1/admin/suppliers'

  /**
   * Get all suppliers with optional filters
   */
  async getSuppliers(
    params?: GetSuppliersParams,
    signal?: AbortSignal,
  ): Promise<Supplier[]> {
    try {
      const response = await apiClient.get<{ suppliers: Supplier[] }>(
        this.baseUrl,
        { params, signal },
      )
      return response.data.suppliers
    } catch (error) {
      console.error('Failed to fetch suppliers:', error)
      throw error
    }
  }

  /**
   * Get single supplier by ID
   */
  async getSupplierById(id: string, signal?: AbortSignal): Promise<Supplier> {
    try {
      const response = await apiClient.get<Supplier>(`${this.baseUrl}/${id}`, {
        signal,
      })
      return response.data
    } catch (error) {
      console.error('Failed to fetch supplier:', error)
      throw error
    }
  }

  /**
   * Get all supplier names for dropdowns
   */
  async getSupplierNames(signal?: AbortSignal): Promise<string[]> {
    try {
      const response = await apiClient.get<{ names: string[] }>(
        `${this.baseUrl}/names`,
        { signal },
      )
      return response.data.names
    } catch (error) {
      console.error('Failed to fetch supplier names:', error)
      throw error
    }
  }

  /**
   * Create new supplier
   */
  async createSupplier(data: CreateSupplierData): Promise<Supplier> {
    try {
      const response = await apiClient.post<Supplier>(this.baseUrl, data)
      return response.data
    } catch (error) {
      console.error('Failed to create supplier:', error)
      throw error
    }
  }

  /**
   * Update supplier
   */
  async updateSupplier(id: string, data: UpdateSupplierData): Promise<Supplier> {
    try {
      const response = await apiClient.put<Supplier>(
        `${this.baseUrl}/${id}`,
        data,
      )
      return response.data
    } catch (error) {
      console.error('Failed to update supplier:', error)
      throw error
    }
  }

  /**
   * Delete supplier
   */
  async deleteSupplier(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`)
    } catch (error) {
      console.error('Failed to delete supplier:', error)
      throw error
    }
  }
}

// Export singleton instance
export const supplierService = new SupplierService()