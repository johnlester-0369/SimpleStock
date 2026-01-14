/**
 * Product Routes
 *
 * Express router for product API endpoints.
 * All routes require user authentication.
 *
 * @module routes/v1/product.routes
 */

import { Router } from 'express';
import { productController } from '@/controllers/product.controller.js';
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
router.get('/stats', productController.getProductStats);
router.get('/low-stock', productController.getLowStockProducts);
router.get('/suppliers', productController.getProductSuppliers);

// CRUD operations
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.post('/:id/sell', productController.sellProduct);
router.delete('/:id', productController.deleteProduct);

export default router;