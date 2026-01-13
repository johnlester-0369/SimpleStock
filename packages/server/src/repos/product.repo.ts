/**
 * Product Repository
 *
 * Data access layer for product operations using Mongoose.
 * Handles all database interactions for products.
 *
 * @module repos/product.repo
 */

import {
  Product,
  LOW_STOCK_THRESHOLD,
  type IProduct,
  type CreateProductInput,
  type UpdateProductInput,
  type ProductFilterOptions,
  type ProductStats,
} from '@/models/product.model.js';
import { logger } from '@/utils/logger.util.js';

/**
 * Product Repository - Data access layer for product operations
 */
class ProductRepository {
  /**
   * Create a new product
   *
   * @param userId - Owner user ID
   * @param input - Product creation data
   * @returns Created product document
   */
  async create(userId: string, input: CreateProductInput): Promise<IProduct> {
    const product = new Product({
      userId,
      name: input.name.trim(),
      price: input.price,
      stockQuantity: input.stockQuantity,
      supplier: input.supplier.trim(),
    });

    const savedProduct = await product.save();

    logger.info('Product created', {
      productId: savedProduct._id.toString(),
      userId,
      name: savedProduct.name,
    });

    return savedProduct;
  }

  /**
   * Find products with optional filters
   *
   * @param options - Filter options
   * @returns Array of matching products
   */
  async findMany(options: ProductFilterOptions): Promise<IProduct[]> {
    const query: Record<string, unknown> = { userId: options.userId };

    // Stock status filter
    if (options.stockStatus && options.stockStatus !== 'all') {
      if (options.stockStatus === 'in-stock') {
        query.stockQuantity = { $gte: LOW_STOCK_THRESHOLD };
      } else if (options.stockStatus === 'low-stock') {
        query.stockQuantity = { $gt: 0, $lt: LOW_STOCK_THRESHOLD };
      } else if (options.stockStatus === 'out-of-stock') {
        query.stockQuantity = 0;
      }
    }

    // Supplier filter
    if (options.supplier) {
      query.supplier = options.supplier;
    }

    // Search in name and supplier
    if (options.search && options.search.trim()) {
      const searchRegex = new RegExp(options.search.trim(), 'i');
      query.$or = [{ name: searchRegex }, { supplier: searchRegex }];
    }

    const products = await Product.find(query).sort({ createdAt: -1 }).exec();

    return products;
  }

  /**
   * Find product by ID and user ID (ensures ownership)
   *
   * @param productId - Product ID
   * @param userId - User ID
   * @returns Product document or null
   */
  async findById(productId: string, userId: string): Promise<IProduct | null> {
    try {
      const product = await Product.findOne({
        _id: productId,
        userId,
      }).exec();

      return product;
    } catch (error) {
      // Invalid ObjectId format
      logger.debug('Invalid product ID format', { productId });
      return null;
    }
  }

  /**
   * Update product by ID (ensures ownership)
   *
   * @param productId - Product ID
   * @param userId - User ID
   * @param input - Update data
   * @returns Updated product or null
   */
  async update(
    productId: string,
    userId: string,
    input: UpdateProductInput,
  ): Promise<IProduct | null> {
    try {
      // Build update object (only include provided fields)
      const updateDoc: Record<string, unknown> = {};

      if (input.name !== undefined) {
        updateDoc.name = input.name.trim();
      }
      if (input.price !== undefined) {
        updateDoc.price = input.price;
      }
      if (input.stockQuantity !== undefined) {
        updateDoc.stockQuantity = input.stockQuantity;
      }
      if (input.supplier !== undefined) {
        updateDoc.supplier = input.supplier.trim();
      }

      // Return current if no updates provided
      if (Object.keys(updateDoc).length === 0) {
        return this.findById(productId, userId);
      }

      const product = await Product.findOneAndUpdate(
        { _id: productId, userId },
        { $set: updateDoc },
        { new: true, runValidators: true },
      ).exec();

      if (product) {
        logger.info('Product updated', {
          productId,
          userId,
          updates: Object.keys(updateDoc),
        });
      }

      return product;
    } catch (error) {
      logger.debug('Error updating product', {
        productId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  /**
   * Sell product (decrement stock quantity)
   *
   * @param productId - Product ID
   * @param userId - User ID
   * @param quantity - Quantity to sell
   * @returns Updated product or null if insufficient stock
   */
  async sell(
    productId: string,
    userId: string,
    quantity: number,
  ): Promise<IProduct | null> {
    try {
      // Atomic update with stock check
      const product = await Product.findOneAndUpdate(
        {
          _id: productId,
          userId,
          stockQuantity: { $gte: quantity },
        },
        { $inc: { stockQuantity: -quantity } },
        { new: true, runValidators: true },
      ).exec();

      if (product) {
        logger.info('Product sold', {
          productId,
          userId,
          quantity,
          remainingStock: product.stockQuantity,
        });
      }

      return product;
    } catch (error) {
      logger.debug('Error selling product', {
        productId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  /**
   * Delete product by ID (ensures ownership)
   *
   * @param productId - Product ID
   * @param userId - User ID
   * @returns True if deleted, false otherwise
   */
  async delete(productId: string, userId: string): Promise<boolean> {
    try {
      const result = await Product.deleteOne({
        _id: productId,
        userId,
      }).exec();

      if (result.deletedCount === 1) {
        logger.info('Product deleted', { productId, userId });
        return true;
      }

      return false;
    } catch (error) {
      logger.debug('Error deleting product', {
        productId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  /**
   * Get product statistics for a user
   *
   * @param userId - User ID
   * @returns Product statistics
   */
  async getStats(userId: string): Promise<ProductStats> {
    const products = await Product.find({ userId }).exec();

    const totalProducts = products.length;
    const totalUnits = products.reduce((sum, p) => sum + p.stockQuantity, 0);
    const totalValue = products.reduce(
      (sum, p) => sum + p.price * p.stockQuantity,
      0,
    );
    const lowStockCount = products.filter(
      (p) => p.stockQuantity > 0 && p.stockQuantity < LOW_STOCK_THRESHOLD,
    ).length;
    const outOfStockCount = products.filter(
      (p) => p.stockQuantity === 0,
    ).length;

    return {
      totalProducts,
      totalUnits,
      totalValue,
      lowStockCount,
      outOfStockCount,
    };
  }

  /**
   * Get all unique supplier names for a user
   *
   * @param userId - User ID
   * @returns Array of unique supplier names
   */
  async getSuppliers(userId: string): Promise<string[]> {
    const suppliers = await Product.distinct('supplier', { userId }).exec();
    return suppliers.sort();
  }

  /**
   * Get low stock products
   *
   * @param userId - User ID
   * @param limit - Maximum number to return
   * @returns Array of low stock products
   */
  async getLowStock(userId: string, limit: number = 5): Promise<IProduct[]> {
    const products = await Product.find({
      userId,
      stockQuantity: { $lt: LOW_STOCK_THRESHOLD },
    })
      .sort({ stockQuantity: 1 })
      .limit(limit)
      .exec();

    return products;
  }
}

// Export singleton instance
export const productRepo = new ProductRepository();