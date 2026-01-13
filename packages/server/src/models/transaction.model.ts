/**
 * Transaction Model
 *
 * Mongoose schema and TypeScript interfaces for Transaction entity.
 * Transactions represent sale records when products are sold.
 *
 * @module models/transaction.model
 */

import mongoose, { Schema, type Document, type Types } from 'mongoose';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Transaction document interface for Mongoose
 */
export interface ITransaction extends Document {
  _id: Types.ObjectId;
  userId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Transaction creation input (without generated fields)
 */
export interface CreateTransactionInput {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
}

/**
 * Transaction filter options for queries
 */
export interface TransactionFilterOptions {
  userId: string;
  search?: string | undefined;
  startDate?: Date | undefined;
  endDate?: Date | undefined;
  productId?: string | undefined;
}

/**
 * Transaction statistics for a period
 */
export interface TransactionStats {
  totalRevenue: number;
  totalTransactions: number;
  totalItemsSold: number;
  averageOrderValue: number;
}

/**
 * Daily sales aggregation
 */
export interface DailySales {
  date: string;
  totalAmount: number;
  transactionCount: number;
  itemsSold: number;
}

/**
 * Client-safe transaction representation (with string ID)
 */
export interface TransactionResponse {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// MONGOOSE SCHEMA
// ============================================================================

const transactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    productId: {
      type: String,
      required: true,
      index: true,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
    collection: 'transactions',
  },
);

// Compound indexes for common queries
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ userId: 1, productId: 1 });
transactionSchema.index({ userId: 1, productName: 1 });

// ============================================================================
// MODEL EXPORT
// ============================================================================

export const Transaction = mongoose.model<ITransaction>(
  'Transaction',
  transactionSchema,
);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert Mongoose Transaction document to client-safe response
 *
 * @param transaction - Mongoose transaction document
 * @returns Client-safe transaction response
 */
export function toTransactionResponse(
  transaction: ITransaction,
): TransactionResponse {
  return {
    id: transaction._id.toString(),
    userId: transaction.userId,
    productId: transaction.productId,
    productName: transaction.productName,
    quantity: transaction.quantity,
    unitPrice: transaction.unitPrice,
    totalAmount: transaction.totalAmount,
    createdAt: transaction.createdAt.toISOString(),
    updatedAt: transaction.updatedAt.toISOString(),
  };
}