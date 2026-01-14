/**
 * Product Controller
 *
 * HTTP request handlers for product operations.
 * Delegates business logic to ProductService.
 *
 * Uses class-based singleton pattern for consistency with
 * services and repositories layers.
 *
 * @module controllers/product.controller
 */

import type { Request, Response } from 'express';
import { productService } from '@/services/product.service.js';
import { isDomainError } from '@/shared/errors.js';
import { logger } from '@/utils/logger.util.js';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Valid stock status filter values
 */
type StockStatusFilter = 'all' | 'in-stock' | 'low-stock' | 'out-of-stock';

/**
 * Stock status validation array
 */
const VALID_STOCK_STATUSES: readonly StockStatusFilter[] = [
  'all',
  'in-stock',
  'low-stock',
  'out-of-stock',
] as const;

// ============================================================================
// CONTROLLER CLASS
// ============================================================================

/**
 * Product Controller - HTTP request handlers for product operations.
 *
 * Follows singleton pattern for consistency with service and repository layers.
 * All methods are arrow functions for automatic `this` binding with Express routes.
 *
 * @example
 * ```typescript
 * import { productController } from '@/controllers/product.controller.js';
 *
 * router.get('/', productController.getProducts);
 * router.post('/', productController.createProduct);
 * ```
 */
class ProductController {
  // ==========================================================================
  // PRIVATE HELPERS
  // ==========================================================================

  /**
   * Handles domain errors and sends appropriate HTTP response.
   * Logs unexpected errors for debugging.
   *
   * @param error - Error to handle
   * @param res - Express response object
   * @param context - Operation context for error messages
   */
  private handleError(error: unknown, res: Response, context: string): void {
    if (isDomainError(error)) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }

    logger.error(`Error in ${context}`, {
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({ error: `Failed to ${context.toLowerCase()}` });
  }

  /**
   * Validates and parses stock status query parameter.
   *
   * @param param - Raw query parameter value
   * @returns Valid stock status or undefined
   */
  private parseStockStatus(param: string | undefined): StockStatusFilter | undefined {
    if (param && VALID_STOCK_STATUSES.includes(param as StockStatusFilter)) {
      return param as StockStatusFilter;
    }
    return undefined;
  }

  /**
   * Parses integer query parameter with fallback.
   *
   * @param param - Raw query parameter value
   * @param defaultValue - Default value if parsing fails
   * @returns Parsed integer or default value
   */
  private parseIntParam(param: string | undefined, defaultValue: number): number {
    if (!param) return defaultValue;
    const parsed = parseInt(param, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  // ==========================================================================
  // GET HANDLERS
  // ==========================================================================

  /**
   * Get all products for authenticated user with optional filters.
   *
   * @route GET /api/v1/admin/products
   * @query search - Optional search keyword
   * @query stockStatus - Optional filter: all, in-stock, low-stock, out-of-stock
   * @query supplier - Optional supplier name filter
   */
  getProducts = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;

      const search = req.query.search as string | undefined;
      const stockStatus = this.parseStockStatus(req.query.stockStatus as string | undefined);
      const supplier = req.query.supplier as string | undefined;

      const products = await productService.getProducts(userId, {
        search,
        stockStatus,
        supplier,
      });

      res.json({ products });
    } catch (error) {
      this.handleError(error, res, 'fetch products');
    }
  };

  /**
   * Get single product by ID.
   *
   * @route GET /api/v1/admin/products/:id
   * @param id - Product ID
   */
  getProductById = async (req: Request, res: Response): Promise<void> => {
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
      this.handleError(error, res, 'fetch product');
    }
  };

  /**
   * Get product statistics for user.
   *
   * @route GET /api/v1/admin/products/stats
   */
  getProductStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const stats = await productService.getProductStats(userId);
      res.json(stats);
    } catch (error) {
      this.handleError(error, res, 'fetch product statistics');
    }
  };

  /**
   * Get low stock products.
   *
   * @route GET /api/v1/admin/products/low-stock
   * @query limit - Optional limit (default: 5)
   */
  getLowStockProducts = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const limit = this.parseIntParam(req.query.limit as string | undefined, 5);

      const result = await productService.getLowStockProducts(userId, limit);
      res.json(result);
    } catch (error) {
      this.handleError(error, res, 'fetch low stock products');
    }
  };

  /**
   * Get unique suppliers from products.
   *
   * @route GET /api/v1/admin/products/suppliers
   */
  getProductSuppliers = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const suppliers = await productService.getProductSuppliers(userId);
      res.json({ suppliers });
    } catch (error) {
      this.handleError(error, res, 'fetch suppliers');
    }
  };

  // ==========================================================================
  // CREATE / UPDATE / DELETE HANDLERS
  // ==========================================================================

  /**
   * Create new product.
   *
   * @route POST /api/v1/admin/products
   * @body name - Product name (2-100 chars)
   * @body price - Product price (min $0.01)
   * @body stockQuantity - Initial stock (min 0)
   * @body supplier - Supplier name
   */
  createProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const product = await productService.createProduct(userId, req.body);
      res.status(201).json(product);
    } catch (error) {
      this.handleError(error, res, 'create product');
    }
  };

  /**
   * Update product.
   *
   * @route PUT /api/v1/admin/products/:id
   * @param id - Product ID
   * @body name - Optional updated name
   * @body price - Optional updated price
   * @body stockQuantity - Optional updated stock
   * @body supplier - Optional updated supplier
   */
  updateProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const productId = req.params.id;

      if (!productId) {
        res.status(400).json({ error: 'Product ID is required' });
        return;
      }

      const product = await productService.updateProduct(productId, userId, req.body);
      res.json(product);
    } catch (error) {
      this.handleError(error, res, 'update product');
    }
  };

  /**
   * Sell product (decrement stock and create transaction).
   *
   * @route POST /api/v1/admin/products/:id/sell
   * @param id - Product ID
   * @body quantity - Quantity to sell (min 1)
   */
  sellProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const productId = req.params.id;

      if (!productId) {
        res.status(400).json({ error: 'Product ID is required' });
        return;
      }

      const quantity = req.body?.quantity;
      const result = await productService.sellProduct(productId, userId, quantity);
      res.json(result);
    } catch (error) {
      this.handleError(error, res, 'sell product');
    }
  };

  /**
   * Delete product.
   *
   * @route DELETE /api/v1/admin/products/:id
   * @param id - Product ID
   */
  deleteProduct = async (req: Request, res: Response): Promise<void> => {
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
      this.handleError(error, res, 'delete product');
    }
  };
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

/**
 * Singleton instance of ProductController.
 * Use this instance in route definitions.
 *
 * @example
 * ```typescript
 * router.get('/', productController.getProducts);
 * ```
 */
export const productController = new ProductController();