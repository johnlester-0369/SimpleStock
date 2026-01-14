/**
 * Transaction Routes
 *
 * Express router for transaction API endpoints.
 * All routes require user authentication.
 *
 * @module routes/v1/transaction.routes
 */

import { Router } from 'express';
import { transactionController } from '@/controllers/transaction.controller.js';
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
router.get('/stats', transactionController.getTransactionStats);
router.get('/daily-sales', transactionController.getDailySales);
router.get('/recent', transactionController.getRecentTransactions);

// CRUD operations
router.get('/', transactionController.getTransactions);
router.get('/:id', transactionController.getTransactionById);

export default router;