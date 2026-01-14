/**
 * Supplier Routes
 *
 * Express router for supplier API endpoints.
 * All routes require user authentication.
 *
 * @module routes/v1/supplier.routes
 */

import { Router } from 'express';
import { supplierController } from '@/controllers/supplier.controller.js';
import { requireUser } from '@/middleware/user.middleware.js';

const router = Router();

/**
 * All supplier routes require authentication
 */
router.use(requireUser);

/**
 * Supplier routes
 * Note: Specific routes must come before parameterized routes
 */

// Name list for dropdowns
router.get('/names', supplierController.getSupplierNames);

// CRUD operations
router.get('/', supplierController.getSuppliers);
router.get('/:id', supplierController.getSupplierById);
router.post('/', supplierController.createSupplier);
router.put('/:id', supplierController.updateSupplier);
router.delete('/:id', supplierController.deleteSupplier);

export default router;