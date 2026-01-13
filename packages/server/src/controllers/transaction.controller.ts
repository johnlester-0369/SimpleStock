/**
 * Transaction Controller
 *
 * HTTP request handlers for transaction operations.
 * Delegates business logic to TransactionService.
 *
 * @module controllers/transaction.controller
 */

import type { Request, Response } from 'express';
import { transactionService, type TransactionPeriod } from '@/services/transaction.service.js';
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

/**
 * Parse and validate period parameter
 */
function parsePeriod(periodParam: string | undefined): TransactionPeriod | undefined {
  const validPeriods: TransactionPeriod[] = ['today', 'week', 'month'];
  if (periodParam && validPeriods.includes(periodParam as TransactionPeriod)) {
    return periodParam as TransactionPeriod;
  }
  return undefined;
}

// ============================================================================
// GET HANDLERS
// ============================================================================

/**
 * Get all transactions for authenticated user with optional filters
 * GET /api/v1/user/transactions?search=keyword&startDate=2025-01-01&endDate=2025-01-31&period=week|month
 */
export const getTransactions = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const search = req.query.search as string | undefined;
    const period = parsePeriod(req.query.period as string | undefined);
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;

    const transactions = await transactionService.getTransactions(userId, {
      search,
      period,
      startDate,
      endDate,
    });

    res.json({ transactions });
  } catch (error) {
    handleError(error, res, 'fetch transactions');
  }
};

/**
 * Get single transaction by ID
 * GET /api/v1/user/transactions/:id
 */
export const getTransactionById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const transactionId = req.params.id;

    if (!transactionId) {
      res.status(400).json({ error: 'Transaction ID is required' });
      return;
    }

    const transaction = await transactionService.getTransactionById(transactionId, userId);
    res.json(transaction);
  } catch (error) {
    handleError(error, res, 'fetch transaction');
  }
};

/**
 * Get transaction statistics for user
 * GET /api/v1/user/transactions/stats?period=week|month
 */
export const getTransactionStats = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const period = parsePeriod(req.query.period as string | undefined);
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;

    const stats = await transactionService.getTransactionStats(userId, {
      period,
      startDate,
      endDate,
    });

    res.json(stats);
  } catch (error) {
    handleError(error, res, 'fetch transaction statistics');
  }
};

/**
 * Get daily sales for reporting
 * GET /api/v1/user/transactions/daily-sales?period=week|month
 */
export const getDailySales = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const period = parsePeriod(req.query.period as string | undefined);
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;

    const result = await transactionService.getDailySales(userId, {
      period,
      startDate,
      endDate,
    });

    res.json(result);
  } catch (error) {
    handleError(error, res, 'fetch daily sales');
  }
};

/**
 * Get recent transactions
 * GET /api/v1/user/transactions/recent?limit=10
 */
export const getRecentTransactions = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const limitParam = req.query.limit as string | undefined;
    const limit = limitParam ? parseInt(limitParam, 10) : 10;

    const transactions = await transactionService.getRecentTransactions(userId, limit);
    res.json({ transactions });
  } catch (error) {
    handleError(error, res, 'fetch recent transactions');
  }
};