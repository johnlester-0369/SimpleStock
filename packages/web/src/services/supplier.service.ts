/**
 * Supplier Service
 *
 * Exports the appropriate supplier service based on environment.
 * - API mode: Uses HTTP client for backend communication
 * - Demo mode: Uses localStorage for offline demo
 *
 * @module services/supplier.service
 */

import { getDataSource } from '@/lib/data-source'
import apiClient from '@/lib/api-client'
import {
  localSupplierService,
  type LocalSupplier,
  type CreateLocalSupplierData,
  type UpdateLocalSupplierData,
  type GetLocalSuppliersParams,
} from '@/lib/local-storage'

// ============================================================================
// TYPE DEFINITIONS (Re-export for consumers)
// ============================================================================

/**
 * Supplier interface matching server response
 */
export type Supplier = LocalSupplier

/**
 * Supplier creation input
 */
export type CreateSupplierData = CreateLocalSupplierData

/**
 * Supplier update input (partial updates allowed)
 */
export type UpdateSupplierData = UpdateLocalSupplierData

/**
 * Query parameters for fetching suppliers
 */
export type GetSuppliersParams = GetLocalSuppliersParams & {
  [key: string]: string | undefined
}

// ============================================================================
// API SERVICE CLASS
// ============================================================================

/**
 * API Supplier Service - HTTP client for supplier operations
 */
class ApiSupplierService {
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

// ============================================================================
// SERVICE EXPORT
// ============================================================================

/** API service instance */
const apiSupplierService = new ApiSupplierService()

/**
 * Supplier service - automatically uses correct implementation based on environment.
 *
 * In demo mode (VITE_DATA_SOURCE=local), uses localStorage.
 * In API mode (VITE_DATA_SOURCE=api), uses HTTP backend.
 */
export const supplierService = getDataSource() === 'local'
  ? localSupplierService
  : apiSupplierService