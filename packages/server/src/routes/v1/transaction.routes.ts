/**
 * Transaction Routes
 *
 * Express router for transaction API endpoints.
 * All routes require user authentication.
 *
 * @module routes/v1/transaction.routes
 */

import { Router } from 'express';
import {
  getTransactions,
  getTransactionById,
  getTransactionStats,
  getDailySales,
  getRecentTransactions,
} from '@/controllers/transaction.controller.js';
import { requireUser } from '@/middleware/user.middleware.js';

const router = Router();

/**
 * All transaction routes require authentication
 */
router.use(requireUser);

/**
 * Transaction routes
 * Note: Specific routes must come before parameterized routes
 */

// Statistics and aggregations
router.get('/stats', getTransactionStats);
router.get('/daily-sales', getDailySales);
router.get('/recent', getRecentTransactions);

// CRUD operations
router.get('/', getTransactions);
router.get('/:id', getTransactionById);

export default router;