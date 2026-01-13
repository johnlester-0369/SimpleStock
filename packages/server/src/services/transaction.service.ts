/**
 * Transaction Service
 *
 * Business logic layer for transaction operations.
 * Handles orchestration between controllers and repositories.
 *
 * @module services/transaction.service
 */

import { transactionRepo } from '@/repos/transaction.repo.js';
import {
  toTransactionResponse,
  type TransactionFilterOptions,
  type TransactionStats,
  type DailySales,
  type TransactionResponse,
} from '@/models/transaction.model.js';
import { NotFoundError } from '@/shared/errors.js';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Period options for filtering transactions
 */
export type TransactionPeriod = 'today' | 'week' | 'month';

/**
 * Date range for queries
 */
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

/**
 * Daily sales result with period info
 */
export interface DailySalesResult {
  dailySales: DailySales[];
  period: {
    startDate: string;
    endDate: string;
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

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

/**
 * Get today's date range
 */
function getTodayRange(now: Date): DateRange {
  const startDate = new Date(now);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(now);
  endDate.setHours(23, 59, 59, 999);
  return { startDate, endDate };
}

// ============================================================================
// SERVICE CLASS
// ============================================================================

/**
 * Transaction Service - Business logic for transaction operations
 */
class TransactionService {
  // ==========================================================================
  // DATE HELPERS
  // ==========================================================================

  /**
   * Parse date string to Date object
   * @returns Date object or undefined if invalid
   */
  parseDate(dateStr: string | undefined): Date | undefined {
    if (!dateStr) return undefined;
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? undefined : date;
  }

  /**
   * Get date range based on period or explicit dates
   */
  getDateRange(options: {
    period?: TransactionPeriod | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
  }): { startDate: Date | undefined; endDate: Date | undefined } {
    const now = new Date();

    if (options.period === 'today') {
      const range = getTodayRange(now);
      return { startDate: range.startDate, endDate: range.endDate };
    }

    if (options.period === 'week') {
      return { startDate: getWeekStart(now), endDate: getWeekEnd(now) };
    }

    if (options.period === 'month') {
      return { startDate: getMonthStart(now), endDate: getMonthEnd(now) };
    }

    return {
      startDate: this.parseDate(options.startDate),
      endDate: this.parseDate(options.endDate),
    };
  }

  /**
   * Get required date range (with defaults for daily sales)
   */
  getRequiredDateRange(options: {
    period?: TransactionPeriod | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
  }): DateRange {
    const now = new Date();

    if (options.period === 'today') {
      return getTodayRange(now);
    }

    if (options.period === 'week') {
      return { startDate: getWeekStart(now), endDate: getWeekEnd(now) };
    }

    if (options.period === 'month') {
      return { startDate: getMonthStart(now), endDate: getMonthEnd(now) };
    }

    return {
      startDate: this.parseDate(options.startDate) ?? getWeekStart(now),
      endDate: this.parseDate(options.endDate) ?? getWeekEnd(now),
    };
  }

  // ==========================================================================
  // READ OPERATIONS
  // ==========================================================================

  /**
   * Get all transactions for a user with optional filters
   *
   * @param userId - User ID
   * @param options - Filter options
   * @returns Array of transaction responses
   */
  async getTransactions(
    userId: string,
    options: {
      search?: string | undefined;
      period?: TransactionPeriod | undefined;
      startDate?: string | undefined;
      endDate?: string | undefined;
    } = {},
  ): Promise<TransactionResponse[]> {
    const dateRange = this.getDateRange(options);

    const filterOptions: TransactionFilterOptions = {
      userId,
      search: options.search,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    };

    const transactions = await transactionRepo.findMany(filterOptions);
    return transactions.map(toTransactionResponse);
  }

  /**
   * Get a single transaction by ID
   *
   * @param transactionId - Transaction ID
   * @param userId - User ID
   * @returns Transaction response
   * @throws {NotFoundError} If transaction not found
   */
  async getTransactionById(
    transactionId: string,
    userId: string,
  ): Promise<TransactionResponse> {
    const transaction = await transactionRepo.findById(transactionId, userId);

    if (!transaction) {
      throw new NotFoundError('Transaction', transactionId);
    }

    return toTransactionResponse(transaction);
  }

  /**
   * Get transaction statistics for a user
   *
   * @param userId - User ID
   * @param options - Filter options
   * @returns Transaction statistics
   */
  async getTransactionStats(
    userId: string,
    options: {
      period?: TransactionPeriod | undefined;
      startDate?: string | undefined;
      endDate?: string | undefined;
    } = {},
  ): Promise<TransactionStats> {
    const dateRange = this.getDateRange(options);
    return transactionRepo.getStats(userId, dateRange.startDate, dateRange.endDate);
  }

  /**
   * Get daily sales for reporting
   *
   * @param userId - User ID
   * @param options - Filter options
   * @returns Daily sales result with period info
   */
  async getDailySales(
    userId: string,
    options: {
      period?: TransactionPeriod | undefined;
      startDate?: string | undefined;
      endDate?: string | undefined;
    } = {},
  ): Promise<DailySalesResult> {
    const dateRange = this.getRequiredDateRange(options);

    const dailySales = await transactionRepo.getDailySales(
      userId,
      dateRange.startDate,
      dateRange.endDate,
    );

    return {
      dailySales,
      period: {
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString(),
      },
    };
  }

  /**
   * Get recent transactions
   *
   * @param userId - User ID
   * @param limit - Maximum number to return
   * @returns Array of recent transaction responses
   */
  async getRecentTransactions(
    userId: string,
    limit: number = 10,
  ): Promise<TransactionResponse[]> {
    const transactions = await transactionRepo.getRecent(userId, limit);
    return transactions.map(toTransactionResponse);
  }
}

// Export singleton instance
export const transactionService = new TransactionService();