/**
 * Supplier Service
 *
 * Business logic layer for supplier operations.
 * Handles orchestration between controllers and repositories.
 *
 * @module services/supplier.service
 */

import { supplierRepo } from '@/repos/supplier.repo.js';
import {
  toSupplierResponse,
  type CreateSupplierInput,
  type UpdateSupplierInput,
  type SupplierFilterOptions,
  type SupplierResponse,
} from '@/models/supplier.model.js';
import { NotFoundError, ValidationError } from '@/shared/errors.js';
import { logger } from '@/utils/logger.util.js';

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Simple email validation regex
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    return EMAIL_REGEX.test(email);
  }

  /**
   * Validates supplier creation input
   * @throws {ValidationError} If validation fails
   */
  private validateCreateInput(input: CreateSupplierInput): void {
    // Validate name
    if (!input.name || input.name.trim().length === 0) {
      throw new ValidationError('Supplier name is required', 'name');
    }
    if (input.name.trim().length < 2) {
      throw new ValidationError('Supplier name must be at least 2 characters', 'name');
    }
    if (input.name.trim().length > 100) {
      throw new ValidationError('Supplier name must not exceed 100 characters', 'name');
    }

    // Validate contact person
    if (!input.contactPerson || input.contactPerson.trim().length === 0) {
      throw new ValidationError('Contact person is required', 'contactPerson');
    }
    if (input.contactPerson.trim().length < 2) {
      throw new ValidationError('Contact person must be at least 2 characters', 'contactPerson');
    }
    if (input.contactPerson.trim().length > 100) {
      throw new ValidationError('Contact person must not exceed 100 characters', 'contactPerson');
    }

    // Validate email
    if (!input.email || input.email.trim().length === 0) {
      throw new ValidationError('Email is required', 'email');
    }
    if (!this.isValidEmail(input.email.trim())) {
      throw new ValidationError('Invalid email format', 'email');
    }

    // Validate phone
    if (!input.phone || input.phone.trim().length === 0) {
      throw new ValidationError('Phone is required', 'phone');
    }
  }

  /**
   * Validates supplier update input
   * @throws {ValidationError} If validation fails
   */
  private validateUpdateInput(input: UpdateSupplierInput): void {
    if (input.name !== undefined) {
      if (input.name.trim().length === 0) {
        throw new ValidationError('Supplier name cannot be empty', 'name');
      }
      if (input.name.trim().length < 2) {
        throw new ValidationError('Supplier name must be at least 2 characters', 'name');
      }
      if (input.name.trim().length > 100) {
        throw new ValidationError('Supplier name must not exceed 100 characters', 'name');
      }
    }

    if (input.contactPerson !== undefined) {
      if (input.contactPerson.trim().length === 0) {
        throw new ValidationError('Contact person cannot be empty', 'contactPerson');
      }
      if (input.contactPerson.trim().length < 2) {
        throw new ValidationError('Contact person must be at least 2 characters', 'contactPerson');
      }
      if (input.contactPerson.trim().length > 100) {
        throw new ValidationError('Contact person must not exceed 100 characters', 'contactPerson');
      }
    }

    if (input.email !== undefined) {
      if (input.email.trim().length === 0) {
        throw new ValidationError('Email cannot be empty', 'email');
      }
      if (!this.isValidEmail(input.email.trim())) {
        throw new ValidationError('Invalid email format', 'email');
      }
    }

    if (input.phone !== undefined) {
      if (input.phone.trim().length === 0) {
        throw new ValidationError('Phone cannot be empty', 'phone');
      }
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
   * @param input - Supplier creation data
   * @returns Created supplier response
   * @throws {ValidationError} If input validation fails
   */
  async createSupplier(userId: string, input: CreateSupplierInput): Promise<SupplierResponse> {
    this.validateCreateInput(input);

    const supplier = await supplierRepo.create(userId, input);

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
   * @param input - Update data
   * @returns Updated supplier response
   * @throws {ValidationError} If input validation fails
   * @throws {NotFoundError} If supplier not found
   */
  async updateSupplier(
    supplierId: string,
    userId: string,
    input: UpdateSupplierInput,
  ): Promise<SupplierResponse> {
    this.validateUpdateInput(input);

    const supplier = await supplierRepo.update(supplierId, userId, input);

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