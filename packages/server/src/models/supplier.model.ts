/**
 * Supplier Model
 *
 * Mongoose schema and TypeScript interfaces for Supplier entity.
 * Suppliers represent vendor contacts for product sourcing.
 *
 * @module models/supplier.model
 */

import mongoose, { Schema, type Document, type Types } from 'mongoose';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Supplier document interface for Mongoose
 */
export interface ISupplier extends Document {
  _id: Types.ObjectId;
  userId: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Supplier creation input (without generated fields)
 */
export interface CreateSupplierInput {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address?: string | undefined;
}

/**
 * Supplier update input (partial updates allowed)
 */
export interface UpdateSupplierInput {
  name?: string | undefined;
  contactPerson?: string | undefined;
  email?: string | undefined;
  phone?: string | undefined;
  address?: string | undefined;
}

/**
 * Supplier filter options for queries
 */
export interface SupplierFilterOptions {
  userId: string;
  search?: string | undefined;
}

/**
 * Client-safe supplier representation (with string ID)
 */
export interface SupplierResponse {
  id: string;
  userId: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// MONGOOSE SCHEMA
// ============================================================================

const supplierSchema = new Schema<ISupplier>(
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
    contactPerson: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
    collection: 'suppliers',
  },
);

// Compound indexes for common queries
supplierSchema.index({ userId: 1, name: 1 });
supplierSchema.index({ userId: 1, email: 1 });

// ============================================================================
// MODEL EXPORT
// ============================================================================

export const Supplier = mongoose.model<ISupplier>('Supplier', supplierSchema);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert Mongoose Supplier document to client-safe response
 *
 * @param supplier - Mongoose supplier document
 * @returns Client-safe supplier response
 */
export function toSupplierResponse(supplier: ISupplier): SupplierResponse {
  return {
    id: supplier._id.toString(),
    userId: supplier.userId,
    name: supplier.name,
    contactPerson: supplier.contactPerson,
    email: supplier.email,
    phone: supplier.phone,
    address: supplier.address,
    createdAt: supplier.createdAt.toISOString(),
    updatedAt: supplier.updatedAt.toISOString(),
  };
}