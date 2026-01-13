/**
 * useProductMutations Hook
 *
 * Custom hook for product mutations (create, update, sell, delete).
 * Handles validation and API calls.
 *
 * @module hooks/useProductMutations
 */

import { useState, useCallback } from 'react'
import {
  productService,
  type Product,
  type CreateProductData,
  type UpdateProductData,
  type SellProductResponse,
} from '@/services/product.service'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Hook options for callbacks
 */
interface UseProductMutationsOptions {
  onSuccess?: (message: string, product?: Product) => void
  onError?: (message: string) => void
}

/**
 * Hook return type
 */
interface UseProductMutationsReturn {
  isSubmitting: boolean
  createProduct: (input: CreateProductData) => Promise<Product | null>
  updateProduct: (id: string, input: UpdateProductData) => Promise<Product | null>
  sellProduct: (id: string, quantity: number) => Promise<SellProductResponse | null>
  deleteProduct: (id: string) => Promise<boolean>
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

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Custom hook to handle product mutations
 *
 * @example
 * ```tsx
 * const { createProduct, updateProduct, deleteProduct, isSubmitting } = useProductMutations({
 *   onSuccess: (message) => showToast(message),
 *   onError: (message) => showError(message)
 * })
 * ```
 */
export function useProductMutations(
  options: UseProductMutationsOptions = {},
): UseProductMutationsReturn {
  const { onSuccess, onError } = options
  const [isSubmitting, setIsSubmitting] = useState(false)

  /**
   * Create a new product
   */
  const createProduct = useCallback(
    async (input: CreateProductData): Promise<Product | null> => {
      // Validate name
      if (isEmpty(input.name)) {
        onError?.('Product name is required')
        return null
      }
      if (sanitize(input.name).length < 2) {
        onError?.('Product name must be at least 2 characters')
        return null
      }
      if (sanitize(input.name).length > 100) {
        onError?.('Product name must not exceed 100 characters')
        return null
      }

      // Validate price
      if (input.price === undefined || input.price === null) {
        onError?.('Price is required')
        return null
      }
      if (input.price < 0.01) {
        onError?.('Price must be at least $0.01')
        return null
      }

      // Validate stock quantity
      if (input.stockQuantity === undefined || input.stockQuantity === null) {
        onError?.('Stock quantity is required')
        return null
      }
      if (input.stockQuantity < 0) {
        onError?.('Stock quantity must be 0 or greater')
        return null
      }

      // Validate supplier
      if (isEmpty(input.supplier)) {
        onError?.('Supplier is required')
        return null
      }

      setIsSubmitting(true)
      try {
        const createdProduct = await productService.createProduct({
          name: sanitize(input.name),
          price: input.price,
          stockQuantity: input.stockQuantity,
          supplier: sanitize(input.supplier),
        })

        onSuccess?.('Product created successfully', createdProduct)
        return createdProduct
      } catch (err: unknown) {
        console.error('Error creating product:', err)
        const errorMessage =
          (err as { response?: { data?: { error?: string } } })?.response?.data
            ?.error || 'Failed to create product. Please try again.'
        onError?.(errorMessage)
        return null
      } finally {
        setIsSubmitting(false)
      }
    },
    [onSuccess, onError],
  )

  /**
   * Update an existing product
   */
  const updateProduct = useCallback(
    async (id: string, input: UpdateProductData): Promise<Product | null> => {
      // Validate name if provided
      if (input.name !== undefined) {
        if (isEmpty(input.name)) {
          onError?.('Product name cannot be empty')
          return null
        }
        if (sanitize(input.name).length < 2) {
          onError?.('Product name must be at least 2 characters')
          return null
        }
        if (sanitize(input.name).length > 100) {
          onError?.('Product name must not exceed 100 characters')
          return null
        }
      }

      // Validate price if provided
      if (input.price !== undefined && input.price < 0.01) {
        onError?.('Price must be at least $0.01')
        return null
      }

      // Validate stock quantity if provided
      if (input.stockQuantity !== undefined && input.stockQuantity < 0) {
        onError?.('Stock quantity must be 0 or greater')
        return null
      }

      // Validate supplier if provided
      if (input.supplier !== undefined && isEmpty(input.supplier)) {
        onError?.('Supplier cannot be empty')
        return null
      }

      setIsSubmitting(true)
      try {
        const updatedProduct = await productService.updateProduct(id, {
          ...input,
          name: input.name !== undefined ? sanitize(input.name) : undefined,
          supplier:
            input.supplier !== undefined ? sanitize(input.supplier) : undefined,
        })

        onSuccess?.('Product updated successfully', updatedProduct)
        return updatedProduct
      } catch (err: unknown) {
        console.error('Error updating product:', err)
        const errorMessage =
          (err as { response?: { data?: { error?: string } } })?.response?.data
            ?.error || 'Failed to update product. Please try again.'
        onError?.(errorMessage)
        return null
      } finally {
        setIsSubmitting(false)
      }
    },
    [onSuccess, onError],
  )

  /**
   * Sell a product (decrement stock)
   */
  const sellProduct = useCallback(
    async (id: string, quantity: number): Promise<SellProductResponse | null> => {
      // Validate quantity
      if (quantity < 1) {
        onError?.('Quantity must be at least 1')
        return null
      }
      if (!Number.isInteger(quantity)) {
        onError?.('Quantity must be a whole number')
        return null
      }

      setIsSubmitting(true)
      try {
        const result = await productService.sellProduct(id, { quantity })

        onSuccess?.(`Sold ${quantity} unit(s) successfully`, result.product)
        return result
      } catch (err: unknown) {
        console.error('Error selling product:', err)
        const errorMessage =
          (err as { response?: { data?: { error?: string } } })?.response?.data
            ?.error || 'Failed to sell product. Please try again.'
        onError?.(errorMessage)
        return null
      } finally {
        setIsSubmitting(false)
      }
    },
    [onSuccess, onError],
  )

  /**
   * Delete a product
   */
  const deleteProduct = useCallback(
    async (id: string): Promise<boolean> => {
      setIsSubmitting(true)
      try {
        await productService.deleteProduct(id)
        onSuccess?.('Product deleted successfully')
        return true
      } catch (err: unknown) {
        console.error('Error deleting product:', err)
        const errorMessage =
          (err as { response?: { data?: { error?: string } } })?.response?.data
            ?.error || 'Failed to delete product. Please try again.'
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
    createProduct,
    updateProduct,
    sellProduct,
    deleteProduct,
  }
}