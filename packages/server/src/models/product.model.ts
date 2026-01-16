/**
 * Product Model
 *
 * Mongoose schema and TypeScript interfaces for Product entity.
 * Products represent inventory items with stock tracking.
 * Supplier is now stored as an ObjectId reference to the Supplier model.
 *
 * @module models/product.model
 */

import mongoose, { Schema, type Document, type Types } from 'mongoose';
import type { ISupplier } from './supplier.model.js';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Product document interface for Mongoose (unpopulated)
 */
export interface IProduct extends Document {
  _id: Types.ObjectId;
  userId: string;
  name: string;
  price: number;
  stockQuantity: number;
  supplierId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Product document with populated supplier
 */
export interface IProductPopulated extends Omit<IProduct, 'supplierId'> {
  supplierId: ISupplier;
}

/**
 * Product creation input (for repository layer)
 * Validated input from validators/product.validator.ts
 */
export interface CreateProductInput {
  name: string;
  price: number;
  stockQuantity: number;
  supplierId: string;
}

/**
 * Product update input (for repository layer)
 * Validated input from validators/product.validator.ts
 */
export interface UpdateProductInput {
  name?: string | undefined;
  price?: number | undefined;
  stockQuantity?: number | undefined;
  supplierId?: string | undefined;
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
  supplierId?: string | undefined;
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
 * Client-safe product representation (with string IDs)
 */
export interface ProductResponse {
  id: string;
  userId: string;
  name: string;
  price: number;
  stockQuantity: number;
  supplierId: string;
  supplierName: string;
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
    supplierId: {
      type: Schema.Types.ObjectId,
      ref: 'Supplier',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'products',
  },
);

// Compound indexes for common queries
productSchema.index({ userId: 1, name: 1 });
productSchema.index({ userId: 1, supplierId: 1 });
productSchema.index({ userId: 1, stockQuantity: 1 });

// ============================================================================
// MODEL EXPORT
// ============================================================================

export const Product = mongoose.model<IProduct>('Product', productSchema);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert populated Mongoose Product document to client-safe response.
 * Requires the product to have supplier populated.
 *
 * @param product - Mongoose product document with populated supplier
 * @returns Client-safe product response
 */
export function toProductResponse(product: IProductPopulated): ProductResponse {
  return {
    id: product._id.toString(),
    userId: product.userId,
    name: product.name,
    price: product.price,
    stockQuantity: product.stockQuantity,
    supplierId: product.supplierId._id.toString(),
    supplierName: product.supplierId.name,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

/**
 * Convert unpopulated product to response (when supplier not available).
 * Uses supplierId as both ID and name fallback.
 *
 * @param product - Mongoose product document (unpopulated)
 * @param supplierName - Supplier name to use
 * @returns Client-safe product response
 */
export function toProductResponseUnpopulated(
  product: IProduct,
  supplierName: string,
): ProductResponse {
  return {
    id: product._id.toString(),
    userId: product.userId,
    name: product.name,
    price: product.price,
    stockQuantity: product.stockQuantity,
    supplierId: product.supplierId.toString(),
    supplierName,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

/**
 * Low stock threshold constant
 */
export const LOW_STOCK_THRESHOLD = 5;