/**
 * Product Controller
 *
 * HTTP request handlers for product operations.
 * Handles validation, calls repository, and formats responses.
 *
 * @module controllers/product.controller
 */

import type { Request, Response } from 'express';
import { productRepo } from '@/repos/product.repo.js';
import { transactionRepo } from '@/repos/transaction.repo.js';
import {
  toProductResponse,
  LOW_STOCK_THRESHOLD,
  type CreateProductInput,
  type UpdateProductInput,
  type SellProductInput,
  type ProductFilterOptions,
} from '@/models/product.model.js';
import { logger } from '@/utils/logger.util.js';

// ============================================================================
// GET HANDLERS
// ============================================================================

/**
 * Get all products for authenticated user with optional filters
 * GET /api/v1/user/products?search=keyword&stockStatus=low-stock&supplier=TechCorp
 */
export const getProducts = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.id;

    // Parse query parameters
    const searchParam = req.query.search as string | undefined;
    const stockStatusParam = req.query.stockStatus as string | undefined;
    const supplierParam = req.query.supplier as string | undefined;

    // Build filter options
    const filterOptions: ProductFilterOptions = { userId };

    if (searchParam) {
      filterOptions.search = searchParam;
    }

    if (
      stockStatusParam &&
      ['all', 'in-stock', 'low-stock', 'out-of-stock'].includes(stockStatusParam)
    ) {
      filterOptions.stockStatus = stockStatusParam as ProductFilterOptions['stockStatus'];
    }

    if (supplierParam) {
      filterOptions.supplier = supplierParam;
    }

    const products = await productRepo.findMany(filterOptions);
    const response = products.map(toProductResponse);

    res.json({ products: response });
  } catch (error) {
    logger.error('Error fetching products', {
      error: error instanceof Error ? error.message : String(error),
      userId: req.user?.id,
    });
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

/**
 * Get single product by ID
 * GET /api/v1/user/products/:id
 */
export const getProductById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const productId = req.params.id;

    if (!productId) {
      res.status(400).json({ error: 'Product ID is required' });
      return;
    }

    const product = await productRepo.findById(productId, userId);

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json(toProductResponse(product));
  } catch (error) {
    logger.error('Error fetching product', {
      error: error instanceof Error ? error.message : String(error),
      productId: req.params.id,
      userId: req.user?.id,
    });
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

/**
 * Get product statistics for user
 * GET /api/v1/user/products/stats
 */
export const getProductStats = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const stats = await productRepo.getStats(userId);

    res.json(stats);
  } catch (error) {
    logger.error('Error fetching product stats', {
      error: error instanceof Error ? error.message : String(error),
      userId: req.user?.id,
    });
    res.status(500).json({ error: 'Failed to fetch product statistics' });
  }
};

/**
 * Get low stock products
 * GET /api/v1/user/products/low-stock
 */
export const getLowStockProducts = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const limitParam = req.query.limit as string | undefined;
    const limit = limitParam ? parseInt(limitParam, 10) : 5;

    const products = await productRepo.getLowStock(userId, limit);
    const response = products.map(toProductResponse);

    res.json({
      products: response,
      threshold: LOW_STOCK_THRESHOLD,
    });
  } catch (error) {
    logger.error('Error fetching low stock products', {
      error: error instanceof Error ? error.message : String(error),
      userId: req.user?.id,
    });
    res.status(500).json({ error: 'Failed to fetch low stock products' });
  }
};

/**
 * Get unique suppliers from products
 * GET /api/v1/user/products/suppliers
 */
export const getProductSuppliers = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const suppliers = await productRepo.getSuppliers(userId);

    res.json({ suppliers });
  } catch (error) {
    logger.error('Error fetching product suppliers', {
      error: error instanceof Error ? error.message : String(error),
      userId: req.user?.id,
    });
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
};

// ============================================================================
// CREATE / UPDATE / DELETE HANDLERS
// ============================================================================

/**
 * Create new product
 * POST /api/v1/user/products
 */
export const createProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const input: CreateProductInput = req.body;

    // Validate name
    if (!input.name || input.name.trim().length === 0) {
      res.status(400).json({ error: 'Product name is required' });
      return;
    }
    if (input.name.trim().length < 2) {
      res.status(400).json({ error: 'Product name must be at least 2 characters' });
      return;
    }
    if (input.name.trim().length > 100) {
      res.status(400).json({ error: 'Product name must not exceed 100 characters' });
      return;
    }

    // Validate price
    if (input.price === undefined || input.price === null) {
      res.status(400).json({ error: 'Price is required' });
      return;
    }
    if (typeof input.price !== 'number' || input.price < 0.01) {
      res.status(400).json({ error: 'Price must be at least $0.01' });
      return;
    }

    // Validate stock quantity
    if (input.stockQuantity === undefined || input.stockQuantity === null) {
      res.status(400).json({ error: 'Stock quantity is required' });
      return;
    }
    if (typeof input.stockQuantity !== 'number' || input.stockQuantity < 0) {
      res.status(400).json({ error: 'Stock quantity must be 0 or greater' });
      return;
    }

    // Validate supplier
    if (!input.supplier || input.supplier.trim().length === 0) {
      res.status(400).json({ error: 'Supplier is required' });
      return;
    }

    const product = await productRepo.create(userId, input);

    logger.info('Product created', {
      productId: product._id.toString(),
      userId,
    });

    res.status(201).json(toProductResponse(product));
  } catch (error) {
    logger.error('Error creating product', {
      error: error instanceof Error ? error.message : String(error),
      userId: req.user?.id,
    });
    res.status(500).json({ error: 'Failed to create product' });
  }
};

/**
 * Update product
 * PUT /api/v1/user/products/:id
 */
export const updateProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const productId = req.params.id;
    const input: UpdateProductInput = req.body;

    if (!productId) {
      res.status(400).json({ error: 'Product ID is required' });
      return;
    }

    // Validate name if being updated
    if (input.name !== undefined) {
      if (input.name.trim().length === 0) {
        res.status(400).json({ error: 'Product name cannot be empty' });
        return;
      }
      if (input.name.trim().length < 2) {
        res.status(400).json({ error: 'Product name must be at least 2 characters' });
        return;
      }
      if (input.name.trim().length > 100) {
        res.status(400).json({ error: 'Product name must not exceed 100 characters' });
        return;
      }
    }

    // Validate price if being updated
    if (input.price !== undefined) {
      if (typeof input.price !== 'number' || input.price < 0.01) {
        res.status(400).json({ error: 'Price must be at least $0.01' });
        return;
      }
    }

    // Validate stock quantity if being updated
    if (input.stockQuantity !== undefined) {
      if (typeof input.stockQuantity !== 'number' || input.stockQuantity < 0) {
        res.status(400).json({ error: 'Stock quantity must be 0 or greater' });
        return;
      }
    }

    // Validate supplier if being updated
    if (input.supplier !== undefined) {
      if (input.supplier.trim().length === 0) {
        res.status(400).json({ error: 'Supplier cannot be empty' });
        return;
      }
    }

    const product = await productRepo.update(productId, userId, input);

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    logger.info('Product updated', { productId, userId });

    res.json(toProductResponse(product));
  } catch (error) {
    logger.error('Error updating product', {
      error: error instanceof Error ? error.message : String(error),
      productId: req.params.id,
      userId: req.user?.id,
    });
    res.status(500).json({ error: 'Failed to update product' });
  }
};

/**
 * Sell product (decrement stock and create transaction)
 * POST /api/v1/user/products/:id/sell
 */
export const sellProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const productId = req.params.id;
    const input: SellProductInput = req.body;

    if (!productId) {
      res.status(400).json({ error: 'Product ID is required' });
      return;
    }

    // Validate quantity
    if (input.quantity === undefined || input.quantity === null) {
      res.status(400).json({ error: 'Quantity is required' });
      return;
    }
    if (typeof input.quantity !== 'number' || input.quantity < 1) {
      res.status(400).json({ error: 'Quantity must be at least 1' });
      return;
    }
    if (!Number.isInteger(input.quantity)) {
      res.status(400).json({ error: 'Quantity must be a whole number' });
      return;
    }

    // Check if product exists first
    const existingProduct = await productRepo.findById(productId, userId);
    if (!existingProduct) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    // Check if enough stock
    if (existingProduct.stockQuantity < input.quantity) {
      res.status(400).json({
        error: `Insufficient stock. Available: ${existingProduct.stockQuantity}`,
      });
      return;
    }

    // Calculate total amount before selling
    const totalAmount = existingProduct.price * input.quantity;

    // Decrement stock
    const product = await productRepo.sell(productId, userId, input.quantity);

    if (!product) {
      res.status(400).json({ error: 'Failed to sell product' });
      return;
    }

    // Create transaction record
    const transaction = await transactionRepo.create(userId, {
      productId: existingProduct._id.toString(),
      productName: existingProduct.name,
      quantity: input.quantity,
      unitPrice: existingProduct.price,
      totalAmount,
    });

    logger.info('Product sold', {
      productId,
      userId,
      quantity: input.quantity,
      remainingStock: product.stockQuantity,
      transactionId: transaction._id.toString(),
    });

    res.json({
      product: toProductResponse(product),
      sold: input.quantity,
      totalAmount,
      transactionId: transaction._id.toString(),
    });
  } catch (error) {
    logger.error('Error selling product', {
      error: error instanceof Error ? error.message : String(error),
      productId: req.params.id,
      userId: req.user?.id,
    });
    res.status(500).json({ error: 'Failed to sell product' });
  }
};

/**
 * Delete product
 * DELETE /api/v1/user/products/:id
 */
export const deleteProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const productId = req.params.id;

    if (!productId) {
      res.status(400).json({ error: 'Product ID is required' });
      return;
    }

    const deleted = await productRepo.delete(productId, userId);

    if (!deleted) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    logger.info('Product deleted', { productId, userId });

    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting product', {
      error: error instanceof Error ? error.message : String(error),
      productId: req.params.id,
      userId: req.user?.id,
    });
    res.status(500).json({ error: 'Failed to delete product' });
  }
};