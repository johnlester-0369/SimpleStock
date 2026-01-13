/**
 * useSupplierMutations Hook
 *
 * Custom hook for supplier mutations (create, update, delete).
 * Uses Zod validators for input validation.
 *
 * @module hooks/useSupplierMutations
 */

import { useState, useCallback } from 'react'
import {
  supplierService,
  type Supplier,
  type CreateSupplierData,
  type UpdateSupplierData,
} from '@/services/supplier.service'
import {
  validateCreateSupplier,
  validateUpdateSupplier,
  sanitize,
} from '@/validators'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Hook options for callbacks
 */
interface UseSupplierMutationsOptions {
  onSuccess?: (message: string, supplier?: Supplier) => void
  onError?: (message: string) => void
}

/**
 * Hook return type
 */
interface UseSupplierMutationsReturn {
  isSubmitting: boolean
  createSupplier: (input: CreateSupplierData) => Promise<Supplier | null>
  updateSupplier: (
    id: string,
    input: UpdateSupplierData,
  ) => Promise<Supplier | null>
  deleteSupplier: (id: string) => Promise<boolean>
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Custom hook to handle supplier mutations with Zod validation.
 *
 * @example
 * ```tsx
 * const { createSupplier, updateSupplier, deleteSupplier, isSubmitting } = useSupplierMutations({
 *   onSuccess: (message) => showToast(message),
 *   onError: (message) => showError(message)
 * })
 *
 * // Create with validation
 * const supplier = await createSupplier({
 *   name: 'TechCorp',
 *   contactPerson: 'John Doe',
 *   email: 'john@techcorp.com',
 *   phone: '+1-555-0123'
 * })
 * ```
 */
export function useSupplierMutations(
  options: UseSupplierMutationsOptions = {},
): UseSupplierMutationsReturn {
  const { onSuccess, onError } = options
  const [isSubmitting, setIsSubmitting] = useState(false)

  /**
   * Create a new supplier with Zod validation.
   */
  const createSupplier = useCallback(
    async (input: CreateSupplierData): Promise<Supplier | null> => {
      // Validate using Zod schema
      const validation = validateCreateSupplier({
        name: input.name,
        contactPerson: input.contactPerson,
        email: input.email,
        phone: input.phone,
        address: input.address ?? '',
      })

      if (!validation.success) {
        onError?.(validation.error ?? 'Validation failed')
        return null
      }

      setIsSubmitting(true)
      try {
        const createdSupplier = await supplierService.createSupplier({
          name: sanitize(input.name),
          contactPerson: sanitize(input.contactPerson),
          email: sanitize(input.email),
          phone: sanitize(input.phone),
          address: input.address ? sanitize(input.address) : undefined,
        })

        onSuccess?.('Supplier created successfully', createdSupplier)
        return createdSupplier
      } catch (err: unknown) {
        console.error('Error creating supplier:', err)
        const errorMessage =
          (err as { response?: { data?: { error?: string } } })?.response?.data
            ?.error ?? 'Failed to create supplier. Please try again.'
        onError?.(errorMessage)
        return null
      } finally {
        setIsSubmitting(false)
      }
    },
    [onSuccess, onError],
  )

  /**
   * Update an existing supplier with Zod validation.
   */
  const updateSupplier = useCallback(
    async (id: string, input: UpdateSupplierData): Promise<Supplier | null> => {
      // Validate using Zod schema
      const validation = validateUpdateSupplier({
        name: input.name,
        contactPerson: input.contactPerson,
        email: input.email,
        phone: input.phone,
        address: input.address,
      })

      if (!validation.success) {
        onError?.(validation.error ?? 'Validation failed')
        return null
      }

      setIsSubmitting(true)
      try {
        const updatedSupplier = await supplierService.updateSupplier(id, {
          ...input,
          name: input.name !== undefined ? sanitize(input.name) : undefined,
          contactPerson:
            input.contactPerson !== undefined
              ? sanitize(input.contactPerson)
              : undefined,
          email: input.email !== undefined ? sanitize(input.email) : undefined,
          phone: input.phone !== undefined ? sanitize(input.phone) : undefined,
          address:
            input.address !== undefined ? sanitize(input.address) : undefined,
        })

        onSuccess?.('Supplier updated successfully', updatedSupplier)
        return updatedSupplier
      } catch (err: unknown) {
        console.error('Error updating supplier:', err)
        const errorMessage =
          (err as { response?: { data?: { error?: string } } })?.response?.data
            ?.error ?? 'Failed to update supplier. Please try again.'
        onError?.(errorMessage)
        return null
      } finally {
        setIsSubmitting(false)
      }
    },
    [onSuccess, onError],
  )

  /**
   * Delete a supplier.
   */
  const deleteSupplier = useCallback(
    async (id: string): Promise<boolean> => {
      setIsSubmitting(true)
      try {
        await supplierService.deleteSupplier(id)
        onSuccess?.('Supplier deleted successfully')
        return true
      } catch (err: unknown) {
        console.error('Error deleting supplier:', err)
        const errorMessage =
          (err as { response?: { data?: { error?: string } } })?.response?.data
            ?.error ?? 'Failed to delete supplier. Please try again.'
        onError?.(errorMessage)
        return false
      } finally {
        setIsSubmitting(false)
      }
    },
    [onSuccess, onError],
  )

  return {
    isSubmitting,
    createSupplier,
    updateSupplier,
    deleteSupplier,
  }
}