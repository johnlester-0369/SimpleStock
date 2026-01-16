/**
 * useProductMutations Hook
 *
 * Custom hook for product mutations (create, update, sell, delete).
 * Uses Zod validators for input validation.
 * Now uses supplierId instead of supplier name.
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
import {
  validateCreateProduct,
  validateUpdateProduct,
  validateSellProductWithMax,
  sanitize,
} from '@/validators'

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
  updateProduct: (
    id: string,
    input: UpdateProductData,
  ) => Promise<Product | null>
  sellProduct: (
    id: string,
    quantity: number,
    availableStock: number,
  ) => Promise<SellProductResponse | null>
  deleteProduct: (id: string) => Promise<boolean>
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Custom hook to handle product mutations with Zod validation.
 * Now uses supplierId instead of supplier name.
 *
 * @example
 * ```tsx
 * const { createProduct, updateProduct, deleteProduct, isSubmitting } = useProductMutations({
 *   onSuccess: (message) => showToast(message),
 *   onError: (message) => showError(message)
 * })
 *
 * // Create with validation - uses supplierId
 * const product = await createProduct({
 *   name: 'Widget',
 *   price: 9.99,
 *   stockQuantity: 100,
 *   supplierId: '507f1f77bcf86cd799439011'
 * })
 * ```
 */
export function useProductMutations(
  options: UseProductMutationsOptions = {},
): UseProductMutationsReturn {
  const { onSuccess, onError } = options
  const [isSubmitting, setIsSubmitting] = useState(false)

  /**
   * Create a new product with Zod validation.
   * Uses supplierId instead of supplier name.
   */
  const createProduct = useCallback(
    async (input: CreateProductData): Promise<Product | null> => {
      // Validate using Zod schema
      const validation = validateCreateProduct({
        name: input.name,
        price: input.price,
        stockQuantity: input.stockQuantity,
        supplierId: input.supplierId,
      })

      if (!validation.success) {
        onError?.(validation.error ?? 'Validation failed')
        return null
      }

      setIsSubmitting(true)
      try {
        const createdProduct = await productService.createProduct({
          name: sanitize(input.name),
          price: input.price,
          stockQuantity: input.stockQuantity,
          supplierId: input.supplierId,
        })

        onSuccess?.('Product created successfully', createdProduct)
        return createdProduct
      } catch (err: unknown) {
        console.error('Error creating product:', err)
        const errorMessage =
          (err as { response?: { data?: { error?: string } } })?.response?.data
            ?.error ?? 'Failed to create product. Please try again.'
        onError?.(errorMessage)
        return null
      } finally {
        setIsSubmitting(false)
      }
    },
    [onSuccess, onError],
  )

  /**
   * Update an existing product with Zod validation.
   * Uses supplierId instead of supplier name.
   */
  const updateProduct = useCallback(
    async (id: string, input: UpdateProductData): Promise<Product | null> => {
      // Validate using Zod schema
      const validation = validateUpdateProduct({
        name: input.name,
        price: input.price,
        stockQuantity: input.stockQuantity,
        supplierId: input.supplierId,
      })

      if (!validation.success) {
        onError?.(validation.error ?? 'Validation failed')
        return null
      }

      setIsSubmitting(true)
      try {
        const updatedProduct = await productService.updateProduct(id, {
          ...input,
          name: input.name !== undefined ? sanitize(input.name) : undefined,
          // supplierId passed through as-is (it's an ID, not user input to sanitize)
        })

        onSuccess?.('Product updated successfully', updatedProduct)
        return updatedProduct
      } catch (err: unknown) {
        console.error('Error updating product:', err)
        const errorMessage =
          (err as { response?: { data?: { error?: string } } })?.response?.data
            ?.error ?? 'Failed to update product. Please try again.'
        onError?.(errorMessage)
        return null
      } finally {
        setIsSubmitting(false)
      }
    },
    [onSuccess, onError],
  )

  /**
   * Sell a product (decrement stock) with Zod validation.
   *
   * @param id - Product ID
   * @param quantity - Quantity to sell
   * @param availableStock - Current available stock for validation
   */
  const sellProduct = useCallback(
    async (
      id: string,
      quantity: number,
      availableStock: number,
    ): Promise<SellProductResponse | null> => {
      // Validate using Zod schema with max constraint
      const validation = validateSellProductWithMax(
        { quantity },
        availableStock,
      )

      if (!validation.success || !validation.data) {
        onError?.(validation.error ?? 'Validation failed')
        return null
      }

      setIsSubmitting(true)
      try {
        const result = await productService.sellProduct(id, {
          quantity: validation.data.quantity,
        })

        onSuccess?.(
          `Sold ${validation.data.quantity} unit(s) successfully`,
          result.product,
        )
        return result
      } catch (err: unknown) {
        console.error('Error selling product:', err)
        const errorMessage =
          (err as { response?: { data?: { error?: string } } })?.response?.data
            ?.error ?? 'Failed to sell product. Please try again.'
        onError?.(errorMessage)
        return null
      } finally {
        setIsSubmitting(false)
      }
    },
    [onSuccess, onError],
  )

  /**
   * Delete a product.
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
            ?.error ?? 'Failed to delete product. Please try again.'
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