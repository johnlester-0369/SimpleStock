/**
 * Transaction Controller
 *
 * HTTP request handlers for transaction operations.
 * Delegates business logic to TransactionService.
 *
 * Uses class-based singleton pattern for consistency with
 * services and repositories layers.
 *
 * @module controllers/transaction.controller
 */

import type { Request, Response } from 'express';
import { transactionService, type TransactionPeriod } from '@/services/transaction.service.js';
import { isDomainError } from '@/shared/errors.js';
import { logger } from '@/lib/logger.lib.js';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Valid transaction period values
 */
const VALID_PERIODS: readonly TransactionPeriod[] = ['today', 'week', 'month'] as const;

// ============================================================================
// CONTROLLER CLASS
// ============================================================================

/**
 * Transaction Controller - HTTP request handlers for transaction operations.
 *
 * Follows singleton pattern for consistency with service and repository layers.
 * All methods are arrow functions for automatic `this` binding with Express routes.
 *
 * @example
 * ```typescript
 * import { transactionController } from '@/controllers/transaction.controller.js';
 *
 * router.get('/', transactionController.getTransactions);
 * router.get('/stats', transactionController.getTransactionStats);
 * ```
 */
class TransactionController {
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
   * Parses and validates period parameter.
   *
   * @param periodParam - Raw period query parameter
   * @returns Valid TransactionPeriod or undefined
   */
  private parsePeriod(periodParam: string | undefined): TransactionPeriod | undefined {
    if (periodParam && VALID_PERIODS.includes(periodParam as TransactionPeriod)) {
      return periodParam as TransactionPeriod;
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
   * Get all transactions for authenticated user with optional filters.
   *
   * @route GET /api/v1/admin/transactions
   * @query search - Optional search keyword
   * @query period - Optional period filter: today, week, month
   * @query startDate - Optional start date (ISO 8601)
   * @query endDate - Optional end date (ISO 8601)
   */
  getTransactions = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;

      const search = req.query.search as string | undefined;
      const period = this.parsePeriod(req.query.period as string | undefined);
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
      this.handleError(error, res, 'fetch transactions');
    }
  };

  /**
   * Get single transaction by ID.
   *
   * @route GET /api/v1/admin/transactions/:id
   * @param id - Transaction ID
   */
  getTransactionById = async (req: Request, res: Response): Promise<void> => {
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
      this.handleError(error, res, 'fetch transaction');
    }
  };

  /**
   * Get transaction statistics for user.
   *
   * @route GET /api/v1/admin/transactions/stats
   * @query period - Optional period filter: today, week, month
   * @query startDate - Optional start date (ISO 8601)
   * @query endDate - Optional end date (ISO 8601)
   */
  getTransactionStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;

      const period = this.parsePeriod(req.query.period as string | undefined);
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;

      const stats = await transactionService.getTransactionStats(userId, {
        period,
        startDate,
        endDate,
      });

      res.json(stats);
    } catch (error) {
      this.handleError(error, res, 'fetch transaction statistics');
    }
  };

  /**
   * Get daily sales for reporting.
   *
   * @route GET /api/v1/admin/transactions/daily-sales
   * @query period - Optional period filter: today, week, month
   * @query startDate - Optional start date (ISO 8601)
   * @query endDate - Optional end date (ISO 8601)
   */
  getDailySales = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;

      const period = this.parsePeriod(req.query.period as string | undefined);
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;

      const result = await transactionService.getDailySales(userId, {
        period,
        startDate,
        endDate,
      });

      res.json(result);
    } catch (error) {
      this.handleError(error, res, 'fetch daily sales');
    }
  };

  /**
   * Get recent transactions.
   *
   * @route GET /api/v1/admin/transactions/recent
   * @query limit - Optional limit (default: 10)
   */
  getRecentTransactions = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const limit = this.parseIntParam(req.query.limit as string | undefined, 10);

      const transactions = await transactionService.getRecentTransactions(userId, limit);
      res.json({ transactions });
    } catch (error) {
      this.handleError(error, res, 'fetch recent transactions');
    }
  };
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

/**
 * Singleton instance of TransactionController.
 * Use this instance in route definitions.
 *
 * @example
 * ```typescript
 * router.get('/', transactionController.getTransactions);
 * ```
 */
export const transactionController = new TransactionController();