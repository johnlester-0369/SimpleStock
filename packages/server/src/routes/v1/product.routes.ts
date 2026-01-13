/**
 * Product Routes
 *
 * Express router for product API endpoints.
 * All routes require user authentication.
 *
 * @module routes/v1/product.routes
 */

import { Router } from 'express';
import {
  getProducts,
  getProductById,
  getProductStats,
  getLowStockProducts,
  getProductSuppliers,
  createProduct,
  updateProduct,
  sellProduct,
  deleteProduct,
} from '@/controllers/product.controller.js';
import { requireUser } from '@/middleware/user.middleware.js';

const router = Router();

/**
 * All product routes require authentication
 */
router.use(requireUser);

/**
 * Product routes
 * Note: Specific routes must come before parameterized routes
 */

// Statistics and aggregations
router.get('/stats', getProductStats);
router.get('/low-stock', getLowStockProducts);
router.get('/suppliers', getProductSuppliers);

// CRUD operations
router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.post('/:id/sell', sellProduct);
router.delete('/:id', deleteProduct);

export default router;