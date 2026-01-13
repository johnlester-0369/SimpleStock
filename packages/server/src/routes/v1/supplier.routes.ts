/**
 * Supplier Routes
 *
 * Express router for supplier API endpoints.
 * All routes require user authentication.
 *
 * @module routes/v1/supplier.routes
 */

import { Router } from 'express';
import {
  getSuppliers,
  getSupplierById,
  getSupplierNames,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from '@/controllers/supplier.controller.js';
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
router.get('/names', getSupplierNames);

// CRUD operations
router.get('/', getSuppliers);
router.get('/:id', getSupplierById);
router.post('/', createSupplier);
router.put('/:id', updateSupplier);
router.delete('/:id', deleteSupplier);

export default router;