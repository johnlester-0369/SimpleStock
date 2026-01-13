/**
 * Transaction Controller
 *
 * HTTP request handlers for transaction operations.
 * Handles validation, calls repository, and formats responses.
 *
 * @module controllers/transaction.controller
 */

import type { Request, Response } from 'express';
import { transactionRepo } from '@/repos/transaction.repo.js';
import { toTransactionResponse } from '@/models/transaction.model.js';
import { logger } from '@/utils/logger.util.js';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Parse date string to Date object, returning undefined if invalid
 */
function parseDate(dateStr: string | undefined): Date | undefined {
  if (!dateStr) return undefined;
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? undefined : date;
}

/**
 * Get the start of the current week (Sunday)
 */
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get the end of the current week (Saturday)
 */
function getWeekEnd(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() + (6 - day));
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Get the start of the current month
 */
function getMonthStart(date: Date): Date {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get the end of the current month
 */
function getMonthEnd(date: Date): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  d.setHours(23, 59, 59, 999);
  return d;
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

    // Parse query parameters
    const searchParam = req.query.search as string | undefined;
    const periodParam = req.query.period as string | undefined;
    const startDateParam = req.query.startDate as string | undefined;
    const endDateParam = req.query.endDate as string | undefined;

    // Build date range based on period or explicit dates
    let startDate: Date | undefined;
    let endDate: Date | undefined;
    const now = new Date();

    if (periodParam === 'today') {
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
    } else if (periodParam === 'week') {
      startDate = getWeekStart(now);
      endDate = getWeekEnd(now);
    } else if (periodParam === 'month') {
      startDate = getMonthStart(now);
      endDate = getMonthEnd(now);
    } else {
      startDate = parseDate(startDateParam);
      endDate = parseDate(endDateParam);
    }

    const transactions = await transactionRepo.findMany({
      userId,
      search: searchParam,
      startDate,
      endDate,
    });

    const response = transactions.map(toTransactionResponse);

    res.json({ transactions: response });
  } catch (error) {
    logger.error('Error fetching transactions', {
      error: error instanceof Error ? error.message : String(error),
      userId: req.user?.id,
    });
    res.status(500).json({ error: 'Failed to fetch transactions' });
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

    const transaction = await transactionRepo.findById(transactionId, userId);

    if (!transaction) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }

    res.json(toTransactionResponse(transaction));
  } catch (error) {
    logger.error('Error fetching transaction', {
      error: error instanceof Error ? error.message : String(error),
      transactionId: req.params.id,
      userId: req.user?.id,
    });
    res.status(500).json({ error: 'Failed to fetch transaction' });
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
    const periodParam = req.query.period as string | undefined;
    const startDateParam = req.query.startDate as string | undefined;
    const endDateParam = req.query.endDate as string | undefined;

    // Build date range
    let startDate: Date | undefined;
    let endDate: Date | undefined;
    const now = new Date();

    if (periodParam === 'today') {
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
    } else if (periodParam === 'week') {
      startDate = getWeekStart(now);
      endDate = getWeekEnd(now);
    } else if (periodParam === 'month') {
      startDate = getMonthStart(now);
      endDate = getMonthEnd(now);
    } else {
      startDate = parseDate(startDateParam);
      endDate = parseDate(endDateParam);
    }

    const stats = await transactionRepo.getStats(userId, startDate, endDate);

    res.json(stats);
  } catch (error) {
    logger.error('Error fetching transaction stats', {
      error: error instanceof Error ? error.message : String(error),
      userId: req.user?.id,
    });
    res.status(500).json({ error: 'Failed to fetch transaction statistics' });
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
    const periodParam = req.query.period as string | undefined;
    const startDateParam = req.query.startDate as string | undefined;
    const endDateParam = req.query.endDate as string | undefined;

    // Build date range
    let startDate: Date;
    let endDate: Date;
    const now = new Date();

    if (periodParam === 'week') {
      startDate = getWeekStart(now);
      endDate = getWeekEnd(now);
    } else if (periodParam === 'month') {
      startDate = getMonthStart(now);
      endDate = getMonthEnd(now);
    } else {
      startDate = parseDate(startDateParam) ?? getWeekStart(now);
      endDate = parseDate(endDateParam) ?? getWeekEnd(now);
    }

    const dailySales = await transactionRepo.getDailySales(
      userId,
      startDate,
      endDate,
    );

    res.json({
      dailySales,
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    });
  } catch (error) {
    logger.error('Error fetching daily sales', {
      error: error instanceof Error ? error.message : String(error),
      userId: req.user?.id,
    });
    res.status(500).json({ error: 'Failed to fetch daily sales' });
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

    const transactions = await transactionRepo.getRecent(userId, limit);
    const response = transactions.map(toTransactionResponse);

    res.json({ transactions: response });
  } catch (error) {
    logger.error('Error fetching recent transactions', {
      error: error instanceof Error ? error.message : String(error),
      userId: req.user?.id,
    });
    res.status(500).json({ error: 'Failed to fetch recent transactions' });
  }
};