/**
 * Supplier Repository
 *
 * Data access layer for supplier operations using Mongoose.
 * Handles all database interactions for suppliers.
 *
 * @module repos/supplier.repo
 */

import {
  Supplier,
  type ISupplier,
  type CreateSupplierInput,
  type UpdateSupplierInput,
  type SupplierFilterOptions,
} from '@/models/supplier.model.js';
import { logger } from '@/utils/logger.util.js';

/**
 * Supplier Repository - Data access layer for supplier operations
 */
class SupplierRepository {
  /**
   * Create a new supplier
   *
   * @param userId - Owner user ID
   * @param input - Supplier creation data
   * @returns Created supplier document
   */
  async create(userId: string, input: CreateSupplierInput): Promise<ISupplier> {
    const supplier = new Supplier({
      userId,
      name: input.name.trim(),
      contactPerson: input.contactPerson.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone.trim(),
      address: input.address?.trim() ?? '',
    });

    const savedSupplier = await supplier.save();

    logger.info('Supplier created', {
      supplierId: savedSupplier._id.toString(),
      userId,
      name: savedSupplier.name,
    });

    return savedSupplier;
  }

  /**
   * Find suppliers with optional filters
   *
   * @param options - Filter options
   * @returns Array of matching suppliers
   */
  async findMany(options: SupplierFilterOptions): Promise<ISupplier[]> {
    const query: Record<string, unknown> = { userId: options.userId };

    // Search in name, contact person, and email
    if (options.search && options.search.trim()) {
      const searchRegex = new RegExp(options.search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { contactPerson: searchRegex },
        { email: searchRegex },
      ];
    }

    const suppliers = await Supplier.find(query).sort({ name: 1 }).exec();

    return suppliers;
  }

  /**
   * Find supplier by ID and user ID (ensures ownership)
   *
   * @param supplierId - Supplier ID
   * @param userId - User ID
   * @returns Supplier document or null
   */
  async findById(
    supplierId: string,
    userId: string,
  ): Promise<ISupplier | null> {
    try {
      const supplier = await Supplier.findOne({
        _id: supplierId,
        userId,
      }).exec();

      return supplier;
    } catch (error) {
      // Invalid ObjectId format
      logger.debug('Invalid supplier ID format', { supplierId });
      return null;
    }
  }

  /**
   * Find supplier by name for a user
   *
   * @param name - Supplier name
   * @param userId - User ID
   * @returns Supplier document or null
   */
  async findByName(name: string, userId: string): Promise<ISupplier | null> {
    const supplier = await Supplier.findOne({
      userId,
      name: { $regex: new RegExp(`^${name}$`, 'i') },
    }).exec();

    return supplier;
  }

  /**
   * Update supplier by ID (ensures ownership)
   *
   * @param supplierId - Supplier ID
   * @param userId - User ID
   * @param input - Update data
   * @returns Updated supplier or null
   */
  async update(
    supplierId: string,
    userId: string,
    input: UpdateSupplierInput,
  ): Promise<ISupplier | null> {
    try {
      // Build update object (only include provided fields)
      const updateDoc: Record<string, unknown> = {};

      if (input.name !== undefined) {
        updateDoc.name = input.name.trim();
      }
      if (input.contactPerson !== undefined) {
        updateDoc.contactPerson = input.contactPerson.trim();
      }
      if (input.email !== undefined) {
        updateDoc.email = input.email.trim().toLowerCase();
      }
      if (input.phone !== undefined) {
        updateDoc.phone = input.phone.trim();
      }
      if (input.address !== undefined) {
        updateDoc.address = input.address.trim();
      }

      // Return current if no updates provided
      if (Object.keys(updateDoc).length === 0) {
        return this.findById(supplierId, userId);
      }

      const supplier = await Supplier.findOneAndUpdate(
        { _id: supplierId, userId },
        { $set: updateDoc },
        { new: true, runValidators: true },
      ).exec();

      if (supplier) {
        logger.info('Supplier updated', {
          supplierId,
          userId,
          updates: Object.keys(updateDoc),
        });
      }

      return supplier;
    } catch (error) {
      logger.debug('Error updating supplier', {
        supplierId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  /**
   * Delete supplier by ID (ensures ownership)
   *
   * @param supplierId - Supplier ID
   * @param userId - User ID
   * @returns True if deleted, false otherwise
   */
  async delete(supplierId: string, userId: string): Promise<boolean> {
    try {
      const result = await Supplier.deleteOne({
        _id: supplierId,
        userId,
      }).exec();

      if (result.deletedCount === 1) {
        logger.info('Supplier deleted', { supplierId, userId });
        return true;
      }

      return false;
    } catch (error) {
      logger.debug('Error deleting supplier', {
        supplierId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  /**
   * Get supplier count for a user
   *
   * @param userId - User ID
   * @returns Supplier count
   */
  async count(userId: string): Promise<number> {
    const count = await Supplier.countDocuments({ userId }).exec();
    return count;
  }

  /**
   * Get all supplier names for a user (for dropdowns)
   *
   * @param userId - User ID
   * @returns Array of supplier names
   */
  async getNames(userId: string): Promise<string[]> {
    const suppliers = await Supplier.find({ userId })
      .select('name')
      .sort({ name: 1 })
      .exec();

    return suppliers.map((s) => s.name);
  }
}

// Export singleton instance
export const supplierRepo = new SupplierRepository();