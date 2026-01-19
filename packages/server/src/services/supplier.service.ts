/**
 * Supplier Service
 *
 * Business logic layer for supplier operations.
 * Handles orchestration between controllers and repositories.
 * Uses Zod validators for input validation.
 *
 * @module services/supplier.service
 */

import { supplierRepo } from '@/repos/supplier.repo.js';
import {
  toSupplierResponse,
  type SupplierFilterOptions,
  type SupplierResponse,
} from '@/models/supplier.model.js';
import {
  NotFoundError,
  ValidationError,
  isZodError,
} from '@/shared/errors.js';
import {
  validateCreateSupplier,
  validateUpdateSupplier,
  type CreateSupplierInput,
  type UpdateSupplierInput,
} from '@/validators/index.js';
import { logger } from '@/lib/logger.lib.js';

// ============================================================================
// SERVICE CLASS
// ============================================================================

/**
 * Supplier Service - Business logic for supplier operations
 */
class SupplierService {
  // ==========================================================================
  // VALIDATION HELPERS
  // ==========================================================================

  /**
   * Validates supplier creation input using Zod schema.
   * @throws {ValidationError} If validation fails
   */
  private validateCreateInput(input: unknown): CreateSupplierInput {
    try {
      return validateCreateSupplier(input);
    } catch (error) {
      if (isZodError(error)) {
        throw ValidationError.fromZodError(error);
      }
      throw error;
    }
  }

  /**
   * Validates supplier update input using Zod schema.
   * @throws {ValidationError} If validation fails
   */
  private validateUpdateInput(input: unknown): UpdateSupplierInput {
    try {
      return validateUpdateSupplier(input);
    } catch (error) {
      if (isZodError(error)) {
        throw ValidationError.fromZodError(error);
      }
      throw error;
    }
  }

  // ==========================================================================
  // READ OPERATIONS
  // ==========================================================================

  /**
   * Get all suppliers for a user with optional filters
   *
   * @param userId - User ID
   * @param options - Filter options
   * @returns Array of supplier responses
   */
  async getSuppliers(
    userId: string,
    options: { search?: string | undefined } = {},
  ): Promise<SupplierResponse[]> {
    const filterOptions: SupplierFilterOptions = {
      userId,
      search: options.search,
    };

    const suppliers = await supplierRepo.findMany(filterOptions);
    return suppliers.map(toSupplierResponse);
  }

  /**
   * Get a single supplier by ID
   *
   * @param supplierId - Supplier ID
   * @param userId - User ID
   * @returns Supplier response
   * @throws {NotFoundError} If supplier not found
   */
  async getSupplierById(supplierId: string, userId: string): Promise<SupplierResponse> {
    const supplier = await supplierRepo.findById(supplierId, userId);

    if (!supplier) {
      throw new NotFoundError('Supplier', supplierId);
    }

    return toSupplierResponse(supplier);
  }

  /**
   * Get all supplier names for dropdowns
   *
   * @param userId - User ID
   * @returns Array of supplier names
   */
  async getSupplierNames(userId: string): Promise<string[]> {
    return supplierRepo.getNames(userId);
  }

  // ==========================================================================
  // WRITE OPERATIONS
  // ==========================================================================

  /**
   * Create a new supplier
   *
   * @param userId - User ID
   * @param input - Supplier creation data (validated by Zod)
   * @returns Created supplier response
   * @throws {ValidationError} If input validation fails
   */
  async createSupplier(userId: string, input: unknown): Promise<SupplierResponse> {
    const validatedInput = this.validateCreateInput(input);

    const supplier = await supplierRepo.create(userId, validatedInput);

    logger.info('Supplier created via service', {
      supplierId: supplier._id.toString(),
      userId,
    });

    return toSupplierResponse(supplier);
  }

  /**
   * Update a supplier
   *
   * @param supplierId - Supplier ID
   * @param userId - User ID
   * @param input - Update data (validated by Zod)
   * @returns Updated supplier response
   * @throws {ValidationError} If input validation fails
   * @throws {NotFoundError} If supplier not found
   */
  async updateSupplier(
    supplierId: string,
    userId: string,
    input: unknown,
  ): Promise<SupplierResponse> {
    const validatedInput = this.validateUpdateInput(input);

    const supplier = await supplierRepo.update(supplierId, userId, validatedInput);

    if (!supplier) {
      throw new NotFoundError('Supplier', supplierId);
    }

    logger.info('Supplier updated via service', { supplierId, userId });

    return toSupplierResponse(supplier);
  }

  /**
   * Delete a supplier
   *
   * @param supplierId - Supplier ID
   * @param userId - User ID
   * @throws {NotFoundError} If supplier not found
   */
  async deleteSupplier(supplierId: string, userId: string): Promise<void> {
    const deleted = await supplierRepo.delete(supplierId, userId);

    if (!deleted) {
      throw new NotFoundError('Supplier', supplierId);
    }

    logger.info('Supplier deleted via service', { supplierId, userId });
  }
}

// Export singleton instance
export const supplierService = new SupplierService();