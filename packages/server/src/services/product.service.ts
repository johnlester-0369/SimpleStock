/**
 * Product Service
 *
 * Business logic layer for product operations.
 * Handles orchestration between controllers and repositories.
 *
 * @module services/product.service
 */

import { productRepo } from '@/repos/product.repo.js';
import { transactionRepo } from '@/repos/transaction.repo.js';
import {
  toProductResponse,
  LOW_STOCK_THRESHOLD,
  type IProduct,
  type CreateProductInput,
  type UpdateProductInput,
  type ProductFilterOptions,
  type ProductStats,
  type ProductResponse,
} from '@/models/product.model.js';
import {
  NotFoundError,
  ValidationError,
  InsufficientStockError,
  OperationFailedError,
} from '@/shared/errors.js';
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
   * Validates product creation input
   * @throws {ValidationError} If validation fails
   */
  private validateCreateInput(input: CreateProductInput): void {
    // Validate name
    if (!input.name || input.name.trim().length === 0) {
      throw new ValidationError('Product name is required', 'name');
    }
    if (input.name.trim().length < 2) {
      throw new ValidationError('Product name must be at least 2 characters', 'name');
    }
    if (input.name.trim().length > 100) {
      throw new ValidationError('Product name must not exceed 100 characters', 'name');
    }

    // Validate price
    if (input.price === undefined || input.price === null) {
      throw new ValidationError('Price is required', 'price');
    }
    if (typeof input.price !== 'number' || input.price < 0.01) {
      throw new ValidationError('Price must be at least $0.01', 'price');
    }

    // Validate stock quantity
    if (input.stockQuantity === undefined || input.stockQuantity === null) {
      throw new ValidationError('Stock quantity is required', 'stockQuantity');
    }
    if (typeof input.stockQuantity !== 'number' || input.stockQuantity < 0) {
      throw new ValidationError('Stock quantity must be 0 or greater', 'stockQuantity');
    }

    // Validate supplier
    if (!input.supplier || input.supplier.trim().length === 0) {
      throw new ValidationError('Supplier is required', 'supplier');
    }
  }

  /**
   * Validates product update input
   * @throws {ValidationError} If validation fails
   */
  private validateUpdateInput(input: UpdateProductInput): void {
    if (input.name !== undefined) {
      if (input.name.trim().length === 0) {
        throw new ValidationError('Product name cannot be empty', 'name');
      }
      if (input.name.trim().length < 2) {
        throw new ValidationError('Product name must be at least 2 characters', 'name');
      }
      if (input.name.trim().length > 100) {
        throw new ValidationError('Product name must not exceed 100 characters', 'name');
      }
    }

    if (input.price !== undefined) {
      if (typeof input.price !== 'number' || input.price < 0.01) {
        throw new ValidationError('Price must be at least $0.01', 'price');
      }
    }

    if (input.stockQuantity !== undefined) {
      if (typeof input.stockQuantity !== 'number' || input.stockQuantity < 0) {
        throw new ValidationError('Stock quantity must be 0 or greater', 'stockQuantity');
      }
    }

    if (input.supplier !== undefined) {
      if (input.supplier.trim().length === 0) {
        throw new ValidationError('Supplier cannot be empty', 'supplier');
      }
    }
  }

  /**
   * Validates sell quantity
   * @throws {ValidationError} If validation fails
   */
  private validateSellQuantity(quantity: number | undefined | null): void {
    if (quantity === undefined || quantity === null) {
      throw new ValidationError('Quantity is required', 'quantity');
    }
    if (typeof quantity !== 'number' || quantity < 1) {
      throw new ValidationError('Quantity must be at least 1', 'quantity');
    }
    if (!Number.isInteger(quantity)) {
      throw new ValidationError('Quantity must be a whole number', 'quantity');
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
   * @param input - Product creation data
   * @returns Created product response
   * @throws {ValidationError} If input validation fails
   */
  async createProduct(userId: string, input: CreateProductInput): Promise<ProductResponse> {
    this.validateCreateInput(input);

    const product = await productRepo.create(userId, input);

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
   * @param input - Update data
   * @returns Updated product response
   * @throws {ValidationError} If input validation fails
   * @throws {NotFoundError} If product not found
   */
  async updateProduct(
    productId: string,
    userId: string,
    input: UpdateProductInput,
  ): Promise<ProductResponse> {
    this.validateUpdateInput(input);

    const product = await productRepo.update(productId, userId, input);

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
   * @param quantity - Quantity to sell
   * @returns Sell result with product, amount, and transaction
   * @throws {ValidationError} If quantity validation fails
   * @throws {NotFoundError} If product not found
   * @throws {InsufficientStockError} If not enough stock
   * @throws {OperationFailedError} If sale operation fails
   */
  async sellProduct(
    productId: string,
    userId: string,
    quantity: number,
  ): Promise<SellProductResult> {
    this.validateSellQuantity(quantity);

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