/**
 * Transaction Repository
 *
 * Data access layer for transaction operations using Mongoose.
 * Handles all database interactions for transactions.
 *
 * @module repos/transaction.repo
 */

import {
  Transaction,
  type ITransaction,
  type CreateTransactionInput,
  type TransactionFilterOptions,
  type TransactionStats,
  type DailySales,
} from '@/models/transaction.model.js';
import { logger } from '@/utils/logger.util.js';

/**
 * Transaction Repository - Data access layer for transaction operations
 */
class TransactionRepository {
  /**
   * Create a new transaction
   *
   * @param userId - Owner user ID
   * @param input - Transaction creation data
   * @returns Created transaction document
   */
  async create(
    userId: string,
    input: CreateTransactionInput,
  ): Promise<ITransaction> {
    const transaction = new Transaction({
      userId,
      productId: input.productId,
      productName: input.productName,
      quantity: input.quantity,
      unitPrice: input.unitPrice,
      totalAmount: input.totalAmount,
    });

    const savedTransaction = await transaction.save();

    logger.info('Transaction created', {
      transactionId: savedTransaction._id.toString(),
      userId,
      productName: savedTransaction.productName,
      totalAmount: savedTransaction.totalAmount,
    });

    return savedTransaction;
  }

  /**
   * Find transactions with optional filters
   *
   * @param options - Filter options
   * @returns Array of matching transactions
   */
  async findMany(options: TransactionFilterOptions): Promise<ITransaction[]> {
    const query: Record<string, unknown> = { userId: options.userId };

    // Date range filter
    if (options.startDate || options.endDate) {
      query.createdAt = {};
      if (options.startDate) {
        (query.createdAt as Record<string, unknown>).$gte = options.startDate;
      }
      if (options.endDate) {
        (query.createdAt as Record<string, unknown>).$lte = options.endDate;
      }
    }

    // Product filter
    if (options.productId) {
      query.productId = options.productId;
    }

    // Search in product name
    if (options.search && options.search.trim()) {
      const searchRegex = new RegExp(options.search.trim(), 'i');
      query.productName = searchRegex;
    }

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .exec();

    return transactions;
  }

  /**
   * Find transaction by ID and user ID (ensures ownership)
   *
   * @param transactionId - Transaction ID
   * @param userId - User ID
   * @returns Transaction document or null
   */
  async findById(
    transactionId: string,
    userId: string,
  ): Promise<ITransaction | null> {
    try {
      const transaction = await Transaction.findOne({
        _id: transactionId,
        userId,
      }).exec();

      return transaction;
    } catch (error) {
      logger.debug('Invalid transaction ID format', {
        transactionId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  /**
   * Get transaction statistics for a user within a date range
   *
   * @param userId - User ID
   * @param startDate - Start date (optional)
   * @param endDate - End date (optional)
   * @returns Transaction statistics
   */
  async getStats(
    userId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<TransactionStats> {
    const query: Record<string, unknown> = { userId };

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        (query.createdAt as Record<string, unknown>).$gte = startDate;
      }
      if (endDate) {
        (query.createdAt as Record<string, unknown>).$lte = endDate;
      }
    }

    const transactions = await Transaction.find(query).exec();

    const totalRevenue = transactions.reduce(
      (sum, t) => sum + t.totalAmount,
      0,
    );
    const totalItemsSold = transactions.reduce((sum, t) => sum + t.quantity, 0);
    const totalTransactions = transactions.length;
    const averageOrderValue =
      totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    return {
      totalRevenue,
      totalTransactions,
      totalItemsSold,
      averageOrderValue,
    };
  }

  /**
   * Get daily sales aggregation for a user within a date range
   *
   * @param userId - User ID
   * @param startDate - Start date
   * @param endDate - End date
   * @returns Array of daily sales data
   */
  async getDailySales(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<DailySales[]> {
    const result = await Transaction.aggregate([
      {
        $match: {
          userId,
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          totalAmount: { $sum: '$totalAmount' },
          transactionCount: { $sum: 1 },
          itemsSold: { $sum: '$quantity' },
        },
      },
      {
        $sort: { _id: -1 },
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          totalAmount: 1,
          transactionCount: 1,
          itemsSold: 1,
        },
      },
    ]).exec();

    return result as DailySales[];
  }

  /**
   * Get recent transactions
   *
   * @param userId - User ID
   * @param limit - Maximum number to return
   * @returns Array of recent transactions
   */
  async getRecent(userId: string, limit: number = 10): Promise<ITransaction[]> {
    const transactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();

    return transactions;
  }

  /**
   * Get transaction count for a user
   *
   * @param userId - User ID
   * @returns Transaction count
   */
  async count(userId: string): Promise<number> {
    const count = await Transaction.countDocuments({ userId }).exec();
    return count;
  }

  /**
   * Delete transaction by ID (ensures ownership)
   *
   * @param transactionId - Transaction ID
   * @param userId - User ID
   * @returns True if deleted, false otherwise
   */
  async delete(transactionId: string, userId: string): Promise<boolean> {
    try {
      const result = await Transaction.deleteOne({
        _id: transactionId,
        userId,
      }).exec();

      if (result.deletedCount === 1) {
        logger.info('Transaction deleted', { transactionId, userId });
        return true;
      }

      return false;
    } catch (error) {
      logger.debug('Error deleting transaction', {
        transactionId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }
}

// Export singleton instance
export const transactionRepo = new TransactionRepository();