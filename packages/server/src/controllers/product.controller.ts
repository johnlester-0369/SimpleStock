/**
 * Product Controller
 *
 * HTTP request handlers for product operations.
 * Delegates business logic to ProductService.
 *
 * @module controllers/product.controller
 */

import type { Request, Response } from 'express';
import { productService } from '@/services/product.service.js';
import { isDomainError } from '@/shared/errors.js';
import { logger } from '@/utils/logger.util.js';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Handle domain errors and send appropriate HTTP response
 */
function handleError(error: unknown, res: Response, context: string): void {
  if (isDomainError(error)) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  logger.error(`Error in ${context}`, {
    error: error instanceof Error ? error.message : String(error),
  });
  res.status(500).json({ error: `Failed to ${context.toLowerCase()}` });
}

// ============================================================================
// GET HANDLERS
// ============================================================================

/**
 * Get all products for authenticated user with optional filters
 * GET /api/v1/admin/products?search=keyword&stockStatus=low-stock&supplier=TechCorp
 */
export const getProducts = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.id;

    // Parse query parameters
    const search = req.query.search as string | undefined;
    const stockStatusParam = req.query.stockStatus as string | undefined;
    const supplier = req.query.supplier as string | undefined;

    // Validate stockStatus if provided
    const validStatuses = ['all', 'in-stock', 'low-stock', 'out-of-stock'];
    const stockStatus = stockStatusParam && validStatuses.includes(stockStatusParam)
      ? (stockStatusParam as 'all' | 'in-stock' | 'low-stock' | 'out-of-stock')
      : undefined;

    const products = await productService.getProducts(userId, {
      search,
      stockStatus,
      supplier,
    });

    res.json({ products });
  } catch (error) {
    handleError(error, res, 'fetch products');
  }
};

/**
 * Get single product by ID
 * GET /api/v1/admin/products/:id
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

    const product = await productService.getProductById(productId, userId);
    res.json(product);
  } catch (error) {
    handleError(error, res, 'fetch product');
  }
};

/**
 * Get product statistics for user
 * GET /api/v1/admin/products/stats
 */
export const getProductStats = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const stats = await productService.getProductStats(userId);
    res.json(stats);
  } catch (error) {
    handleError(error, res, 'fetch product statistics');
  }
};

/**
 * Get low stock products
 * GET /api/v1/admin/products/low-stock
 */
export const getLowStockProducts = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const limitParam = req.query.limit as string | undefined;
    const limit = limitParam ? parseInt(limitParam, 10) : 5;

    const result = await productService.getLowStockProducts(userId, limit);
    res.json(result);
  } catch (error) {
    handleError(error, res, 'fetch low stock products');
  }
};

/**
 * Get unique suppliers from products
 * GET /api/v1/admin/products/suppliers
 */
export const getProductSuppliers = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const suppliers = await productService.getProductSuppliers(userId);
    res.json({ suppliers });
  } catch (error) {
    handleError(error, res, 'fetch suppliers');
  }
};

// ============================================================================
// CREATE / UPDATE / DELETE HANDLERS
// ============================================================================

/**
 * Create new product
 * POST /api/v1/admin/products
 */
export const createProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    // Pass raw body - service handles validation with Zod
    const product = await productService.createProduct(userId, req.body);
    res.status(201).json(product);
  } catch (error) {
    handleError(error, res, 'create product');
  }
};

/**
 * Update product
 * PUT /api/v1/admin/products/:id
 */
export const updateProduct = async (
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

    // Pass raw body - service handles validation with Zod
    const product = await productService.updateProduct(productId, userId, req.body);
    res.json(product);
  } catch (error) {
    handleError(error, res, 'update product');
  }
};

/**
 * Sell product (decrement stock and create transaction)
 * POST /api/v1/admin/products/:id/sell
 */
export const sellProduct = async (
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

    // Extract quantity - service validates with Zod
    const quantity = req.body?.quantity;
    const result = await productService.sellProduct(productId, userId, quantity);
    res.json(result);
  } catch (error) {
    handleError(error, res, 'sell product');
  }
};

/**
 * Delete product
 * DELETE /api/v1/admin/products/:id
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

    await productService.deleteProduct(productId, userId);
    res.status(204).send();
  } catch (error) {
    handleError(error, res, 'delete product');
  }
};