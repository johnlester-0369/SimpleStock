/**
 * Product Model
 *
 * Mongoose schema and TypeScript interfaces for Product entity.
 * Products represent inventory items with stock tracking.
 *
 * Note: Input types are now defined in validators/product.validator.ts
 * This file focuses on the Mongoose model and response types.
 *
 * @module models/product.model
 */

import mongoose, { Schema, type Document, type Types } from 'mongoose';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Product document interface for Mongoose
 */
export interface IProduct extends Document {
  _id: Types.ObjectId;
  userId: string;
  name: string;
  price: number;
  stockQuantity: number;
  supplier: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Product creation input (for repository layer)
 * Validated input from validators/product.validator.ts
 */
export interface CreateProductInput {
  name: string;
  price: number;
  stockQuantity: number;
  supplier: string;
}

/**
 * Product update input (for repository layer)
 * Validated input from validators/product.validator.ts
 */
export interface UpdateProductInput {
  name?: string | undefined;
  price?: number | undefined;
  stockQuantity?: number | undefined;
  supplier?: string | undefined;
}

/**
 * Sell product input
 */
export interface SellProductInput {
  quantity: number;
}

/**
 * Product filter options for queries
 */
export interface ProductFilterOptions {
  userId: string;
  search?: string | undefined;
  stockStatus?: 'all' | 'in-stock' | 'low-stock' | 'out-of-stock' | undefined;
  supplier?: string | undefined;
}

/**
 * Product statistics
 */
export interface ProductStats {
  totalProducts: number;
  totalUnits: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
}

/**
 * Client-safe product representation (with string ID)
 */
export interface ProductResponse {
  id: string;
  userId: string;
  name: string;
  price: number;
  stockQuantity: number;
  supplier: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// MONGOOSE SCHEMA
// ============================================================================

const productSchema = new Schema<IProduct>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    price: {
      type: Number,
      required: true,
      min: 0.01,
    },
    stockQuantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    supplier: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: 'products',
  },
);

// Compound indexes for common queries
productSchema.index({ userId: 1, name: 1 });
productSchema.index({ userId: 1, supplier: 1 });
productSchema.index({ userId: 1, stockQuantity: 1 });

// ============================================================================
// MODEL EXPORT
// ============================================================================

export const Product = mongoose.model<IProduct>('Product', productSchema);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert Mongoose Product document to client-safe response
 *
 * @param product - Mongoose product document
 * @returns Client-safe product response
 */
export function toProductResponse(product: IProduct): ProductResponse {
  return {
    id: product._id.toString(),
    userId: product.userId,
    name: product.name,
    price: product.price,
    stockQuantity: product.stockQuantity,
    supplier: product.supplier,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

/**
 * Low stock threshold constant
 */
export const LOW_STOCK_THRESHOLD = 5;