/**
 * Local Supplier Service
 *
 * localStorage-based supplier service for demo mode.
 * Implements the same interface as the API supplier service.
 *
 * @module lib/local-storage/supplier.local
 */

import {
  STORAGE_KEYS,
  getStorageItem,
  setStorageItem,
  generateId,
  getCurrentTimestamp,
} from './storage.util'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Supplier interface
 */
export interface LocalSupplier {
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
 * Create supplier input
 */
export interface CreateLocalSupplierData {
  name: string
  contactPerson: string
  email: string
  phone: string
  address?: string
}

/**
 * Update supplier input
 */
export interface UpdateLocalSupplierData {
  name?: string
  contactPerson?: string
  email?: string
  phone?: string
  address?: string
}

/**
 * Query parameters
 */
export interface GetLocalSuppliersParams {
  search?: string
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEMO_USER_ID = 'demo-user-001'

// ============================================================================
// SEED DATA
// ============================================================================

/**
 * Default suppliers for demo mode
 */
function getDefaultSuppliers(): LocalSupplier[] {
  const now = getCurrentTimestamp()
  return [
    {
      id: generateId(),
      userId: DEMO_USER_ID,
      name: 'TechSupply Co',
      contactPerson: 'John Smith',
      email: 'john@techsupply.com',
      phone: '+1-555-0101',
      address: '123 Tech Lane, Silicon Valley, CA 94000',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      userId: DEMO_USER_ID,
      name: 'GadgetWorld',
      contactPerson: 'Sarah Johnson',
      email: 'sarah@gadgetworld.com',
      phone: '+1-555-0202',
      address: '456 Gadget Ave, Austin, TX 78701',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      userId: DEMO_USER_ID,
      name: 'Office Essentials',
      contactPerson: 'Mike Brown',
      email: 'mike@officeessentials.com',
      phone: '+1-555-0303',
      address: '789 Office Blvd, Seattle, WA 98101',
      createdAt: now,
      updatedAt: now,
    },
  ]
}

// ============================================================================
// LOCAL SUPPLIER SERVICE
// ============================================================================

/**
 * Local supplier service using localStorage
 */
class LocalSupplierService {
  /**
   * Initialize storage with seed data if empty
   */
  private initializeIfEmpty(): LocalSupplier[] {
    let suppliers = getStorageItem<LocalSupplier[]>(STORAGE_KEYS.SUPPLIERS, [])
    if (suppliers.length === 0) {
      suppliers = getDefaultSuppliers()
      setStorageItem(STORAGE_KEYS.SUPPLIERS, suppliers)
    }
    return suppliers
  }

  /**
   * Get all suppliers with optional filters
   */
  async getSuppliers(
    params?: GetLocalSuppliersParams,
    _signal?: AbortSignal,
  ): Promise<LocalSupplier[]> {
    await new Promise((resolve) => setTimeout(resolve, 200))

    let suppliers = this.initializeIfEmpty()

    if (params?.search) {
      const searchLower = params.search.toLowerCase()
      suppliers = suppliers.filter(
        (s) =>
          s.name.toLowerCase().includes(searchLower) ||
          s.contactPerson.toLowerCase().includes(searchLower) ||
          s.email.toLowerCase().includes(searchLower),
      )
    }

    return suppliers
  }

  /**
   * Get single supplier by ID
   */
  async getSupplierById(id: string, _signal?: AbortSignal): Promise<LocalSupplier> {
    await new Promise((resolve) => setTimeout(resolve, 100))

    const suppliers = this.initializeIfEmpty()
    const supplier = suppliers.find((s) => s.id === id)

    if (!supplier) {
      throw new Error('Supplier not found')
    }

    return supplier
  }

  /**
   * Get supplier names for dropdowns
   */
  async getSupplierNames(_signal?: AbortSignal): Promise<string[]> {
    await new Promise((resolve) => setTimeout(resolve, 100))

    const suppliers = this.initializeIfEmpty()
    return suppliers.map((s) => s.name).sort()
  }

  /**
   * Create new supplier
   */
  async createSupplier(data: CreateLocalSupplierData): Promise<LocalSupplier> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const suppliers = this.initializeIfEmpty()
    const now = getCurrentTimestamp()

    const newSupplier: LocalSupplier = {
      id: generateId(),
      userId: DEMO_USER_ID,
      name: data.name,
      contactPerson: data.contactPerson,
      email: data.email,
      phone: data.phone,
      address: data.address ?? '',
      createdAt: now,
      updatedAt: now,
    }

    suppliers.push(newSupplier)
    setStorageItem(STORAGE_KEYS.SUPPLIERS, suppliers)

    return newSupplier
  }

  /**
   * Update supplier
   */
  async updateSupplier(
    id: string,
    data: UpdateLocalSupplierData,
  ): Promise<LocalSupplier> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const suppliers = this.initializeIfEmpty()
    const index = suppliers.findIndex((s) => s.id === id)

    if (index === -1) {
      throw new Error('Supplier not found')
    }

    const updatedSupplier: LocalSupplier = {
      ...suppliers[index],
      ...data,
      updatedAt: getCurrentTimestamp(),
    }

    suppliers[index] = updatedSupplier
    setStorageItem(STORAGE_KEYS.SUPPLIERS, suppliers)

    return updatedSupplier
  }

  /**
   * Delete supplier
   */
  async deleteSupplier(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const suppliers = this.initializeIfEmpty()
    const index = suppliers.findIndex((s) => s.id === id)

    if (index === -1) {
      throw new Error('Supplier not found')
    }

    suppliers.splice(index, 1)
    setStorageItem(STORAGE_KEYS.SUPPLIERS, suppliers)
  }
}

/** Singleton instance */
export const localSupplierService = new LocalSupplierService()