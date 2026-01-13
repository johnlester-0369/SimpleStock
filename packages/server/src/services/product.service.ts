/**
 * Product Service
 *
 * Business logic layer for product operations.
 * Handles orchestration between controllers and repositories.
 * Uses Zod validators for input validation.
 *
 * @module services/product.service
 */

import { z } from 'zod';
import { productRepo } from '@/repos/product.repo.js';
import { transactionRepo } from '@/repos/transaction.repo.js';
import {
  toProductResponse,
  LOW_STOCK_THRESHOLD,
  type ProductFilterOptions,
  type ProductStats,
  type ProductResponse,
} from '@/models/product.model.js';
import {
  NotFoundError,
  ValidationError,
  InsufficientStockError,
  OperationFailedError,
  isZodError,
} from '@/shared/errors.js';
import {
  validateCreateProduct,
  validateUpdateProduct,
  validateSellProduct,
  type CreateProductInput,
  type UpdateProductInput,
} from '@/validators/index.js';
import { logger } from '@/utils/logger.util.js';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Result of a product sale operation
 */
export interface SellProductResult {
  product: ProductResponse;
  sold: number;
  totalAmount: number;
  transactionId: string;
}

/**
 * Low stock products result
 */
export interface LowStockResult {
  products: ProductResponse[];
  threshold: number;
}

// ============================================================================
// SERVICE CLASS
// ============================================================================

/**
 * Product Service - Business logic for product operations
 */
class ProductService {
  // ==========================================================================
  // VALIDATION HELPERS
  // ==========================================================================

  /**
   * Validates product creation input using Zod schema.
   * @throws {ValidationError} If validation fails
   */
  private validateCreateInput(input: unknown): CreateProductInput {
    try {
      return validateCreateProduct(input);
    } catch (error) {
      if (isZodError(error)) {
        throw ValidationError.fromZodError(error);
      }
      throw error;
    }
  }

  /**
   * Validates product update input using Zod schema.
   * @throws {ValidationError} If validation fails
   */
  private validateUpdateInput(input: unknown): UpdateProductInput {
    try {
      return validateUpdateProduct(input);
    } catch (error) {
      if (isZodError(error)) {
        throw ValidationError.fromZodError(error);
      }
      throw error;
    }
  }

  /**
   * Validates sell quantity using Zod schema.
   * @throws {ValidationError} If validation fails
   */
  private validateSellInput(input: unknown): { quantity: number } {
    try {
      return validateSellProduct(input);
    } catch (error) {
      if (isZodError(error)) {
        throw ValidationError.fromZodError(error);
      }
      throw error;
    }
  }

  // ==========================================================================
  // READ OPERATIONS
  // ==========================================================================

  /**
   * Get all products for a user with optional filters
   *
   * @param userId - User ID
   * @param options - Filter options
   * @returns Array of product responses
   */
  async getProducts(
    userId: string,
    options: {
      search?: string | undefined;
      stockStatus?: 'all' | 'in-stock' | 'low-stock' | 'out-of-stock' | undefined;
      supplier?: string | undefined;
    } = {},
  ): Promise<ProductResponse[]> {
    const filterOptions: ProductFilterOptions = {
      userId,
      search: options.search,
      stockStatus: options.stockStatus,
      supplier: options.supplier,
    };

    const products = await productRepo.findMany(filterOptions);
    return products.map(toProductResponse);
  }

  /**
   * Get a single product by ID
   *
   * @param productId - Product ID
   * @param userId - User ID
   * @returns Product response
   * @throws {NotFoundError} If product not found
   */
  async getProductById(productId: string, userId: string): Promise<ProductResponse> {
    const product = await productRepo.findById(productId, userId);

    if (!product) {
      throw new NotFoundError('Product', productId);
    }

    return toProductResponse(product);
  }

  /**
   * Get product statistics for a user
   *
   * @param userId - User ID
   * @returns Product statistics
   */
  async getProductStats(userId: string): Promise<ProductStats> {
    return productRepo.getStats(userId);
  }

  /**
   * Get low stock products for a user
   *
   * @param userId - User ID
   * @param limit - Maximum number to return
   * @returns Low stock result with products and threshold
   */
  async getLowStockProducts(userId: string, limit: number = 5): Promise<LowStockResult> {
    const products = await productRepo.getLowStock(userId, limit);
    return {
      products: products.map(toProductResponse),
      threshold: LOW_STOCK_THRESHOLD,
    };
  }

  /**
   * Get unique supplier names from products
   *
   * @param userId - User ID
   * @returns Array of supplier names
   */
  async getProductSuppliers(userId: string): Promise<string[]> {
    return productRepo.getSuppliers(userId);
  }

  // ==========================================================================
  // WRITE OPERATIONS
  // ==========================================================================

  /**
   * Create a new product
   *
   * @param userId - User ID
   * @param input - Product creation data (validated by Zod)
   * @returns Created product response
   * @throws {ValidationError} If input validation fails
   */
  async createProduct(userId: string, input: unknown): Promise<ProductResponse> {
    const validatedInput = this.validateCreateInput(input);

    const product = await productRepo.create(userId, validatedInput);

    logger.info('Product created via service', {
      productId: product._id.toString(),
      userId,
    });

    return toProductResponse(product);
  }

  /**
   * Update a product
   *
   * @param productId - Product ID
   * @param userId - User ID
   * @param input - Update data (validated by Zod)
   * @returns Updated product response
   * @throws {ValidationError} If input validation fails
   * @throws {NotFoundError} If product not found
   */
  async updateProduct(
    productId: string,
    userId: string,
    input: unknown,
  ): Promise<ProductResponse> {
    const validatedInput = this.validateUpdateInput(input);

    const product = await productRepo.update(productId, userId, validatedInput);

    if (!product) {
      throw new NotFoundError('Product', productId);
    }

    logger.info('Product updated via service', { productId, userId });

    return toProductResponse(product);
  }

  /**
   * Sell a product (decrement stock and create transaction)
   *
   * @param productId - Product ID
   * @param userId - User ID
   * @param quantityInput - Quantity to sell (raw input, validated by Zod)
   * @returns Sell result with product, amount, and transaction
   * @throws {ValidationError} If quantity validation fails
   * @throws {NotFoundError} If product not found
   * @throws {InsufficientStockError} If not enough stock
   * @throws {OperationFailedError} If sale operation fails
   */
  async sellProduct(
    productId: string,
    userId: string,
    quantityInput: number,
  ): Promise<SellProductResult> {
    const { quantity } = this.validateSellInput({ quantity: quantityInput });

    // Check if product exists first
    const existingProduct = await productRepo.findById(productId, userId);
    if (!existingProduct) {
      throw new NotFoundError('Product', productId);
    }

    // Check if enough stock
    if (existingProduct.stockQuantity < quantity) {
      throw new InsufficientStockError(existingProduct.stockQuantity, quantity);
    }

    // Calculate total amount before selling
    const totalAmount = existingProduct.price * quantity;

    // Decrement stock
    const product = await productRepo.sell(productId, userId, quantity);

    if (!product) {
      throw new OperationFailedError('Sell product', 'Stock update failed');
    }

    // Create transaction record
    const transaction = await transactionRepo.create(userId, {
      productId: existingProduct._id.toString(),
      productName: existingProduct.name,
      quantity,
      unitPrice: existingProduct.price,
      totalAmount,
    });

    logger.info('Product sold via service', {
      productId,
      userId,
      quantity,
      remainingStock: product.stockQuantity,
      transactionId: transaction._id.toString(),
    });

    return {
      product: toProductResponse(product),
      sold: quantity,
      totalAmount,
      transactionId: transaction._id.toString(),
    };
  }

  /**
   * Delete a product
   *
   * @param productId - Product ID
   * @param userId - User ID
   * @throws {NotFoundError} If product not found
   */
  async deleteProduct(productId: string, userId: string): Promise<void> {
    const deleted = await productRepo.delete(productId, userId);

    if (!deleted) {
      throw new NotFoundError('Product', productId);
    }

    logger.info('Product deleted via service', { productId, userId });
  }
}

// Export singleton instance
export const productService = new ProductService();