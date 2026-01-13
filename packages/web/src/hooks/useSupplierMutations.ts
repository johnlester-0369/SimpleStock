/**
 * useSupplierMutations Hook
 *
 * Custom hook for supplier mutations (create, update, delete).
 * Handles validation and API calls.
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
  updateSupplier: (id: string, input: UpdateSupplierData) => Promise<Supplier | null>
  deleteSupplier: (id: string) => Promise<boolean>
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Sanitize string input
 */
function sanitize(value: string): string {
  return value.trim()
}

/**
 * Check if value is empty
 */
function isEmpty(value: string | undefined | null): boolean {
  return !value || value.trim().length === 0
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Custom hook to handle supplier mutations
 *
 * @example
 * ```tsx
 * const { createSupplier, updateSupplier, deleteSupplier, isSubmitting } = useSupplierMutations({
 *   onSuccess: (message) => showToast(message),
 *   onError: (message) => showError(message)
 * })
 * ```
 */
export function useSupplierMutations(
  options: UseSupplierMutationsOptions = {},
): UseSupplierMutationsReturn {
  const { onSuccess, onError } = options
  const [isSubmitting, setIsSubmitting] = useState(false)

  /**
   * Create a new supplier
   */
  const createSupplier = useCallback(
    async (input: CreateSupplierData): Promise<Supplier | null> => {
      // Validate name
      if (isEmpty(input.name)) {
        onError?.('Supplier name is required')
        return null
      }
      if (sanitize(input.name).length < 2) {
        onError?.('Supplier name must be at least 2 characters')
        return null
      }
      if (sanitize(input.name).length > 100) {
        onError?.('Supplier name must not exceed 100 characters')
        return null
      }

      // Validate contact person
      if (isEmpty(input.contactPerson)) {
        onError?.('Contact person is required')
        return null
      }
      if (sanitize(input.contactPerson).length < 2) {
        onError?.('Contact person must be at least 2 characters')
        return null
      }
      if (sanitize(input.contactPerson).length > 100) {
        onError?.('Contact person must not exceed 100 characters')
        return null
      }

      // Validate email
      if (isEmpty(input.email)) {
        onError?.('Email is required')
        return null
      }
      if (!isValidEmail(sanitize(input.email))) {
        onError?.('Invalid email format')
        return null
      }

      // Validate phone
      if (isEmpty(input.phone)) {
        onError?.('Phone is required')
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
            ?.error || 'Failed to create supplier. Please try again.'
        onError?.(errorMessage)
        return null
      } finally {
        setIsSubmitting(false)
      }
    },
    [onSuccess, onError],
  )

  /**
   * Update an existing supplier
   */
  const updateSupplier = useCallback(
    async (id: string, input: UpdateSupplierData): Promise<Supplier | null> => {
      // Validate name if provided
      if (input.name !== undefined) {
        if (isEmpty(input.name)) {
          onError?.('Supplier name cannot be empty')
          return null
        }
        if (sanitize(input.name).length < 2) {
          onError?.('Supplier name must be at least 2 characters')
          return null
        }
        if (sanitize(input.name).length > 100) {
          onError?.('Supplier name must not exceed 100 characters')
          return null
        }
      }

      // Validate contact person if provided
      if (input.contactPerson !== undefined) {
        if (isEmpty(input.contactPerson)) {
          onError?.('Contact person cannot be empty')
          return null
        }
        if (sanitize(input.contactPerson).length < 2) {
          onError?.('Contact person must be at least 2 characters')
          return null
        }
        if (sanitize(input.contactPerson).length > 100) {
          onError?.('Contact person must not exceed 100 characters')
          return null
        }
      }

      // Validate email if provided
      if (input.email !== undefined) {
        if (isEmpty(input.email)) {
          onError?.('Email cannot be empty')
          return null
        }
        if (!isValidEmail(sanitize(input.email))) {
          onError?.('Invalid email format')
          return null
        }
      }

      // Validate phone if provided
      if (input.phone !== undefined && isEmpty(input.phone)) {
        onError?.('Phone cannot be empty')
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
            ?.error || 'Failed to update supplier. Please try again.'
        onError?.(errorMessage)
        return null
      } finally {
        setIsSubmitting(false)
      }
    },
    [onSuccess, onError],
  )

  /**
   * Delete a supplier
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
            ?.error || 'Failed to delete supplier. Please try again.'
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