/**
 * Supplier Controller
 *
 * HTTP request handlers for supplier operations.
 * Delegates business logic to SupplierService.
 *
 * Uses class-based singleton pattern for consistency with
 * services and repositories layers.
 *
 * @module controllers/supplier.controller
 */

import type { Request, Response } from 'express';
import { supplierService } from '@/services/supplier.service.js';
import { isDomainError } from '@/shared/errors.js';
import { logger } from '@/lib/logger.lib.js';

// ============================================================================
// CONTROLLER CLASS
// ============================================================================

/**
 * Supplier Controller - HTTP request handlers for supplier operations.
 *
 * Follows singleton pattern for consistency with service and repository layers.
 * All methods are arrow functions for automatic `this` binding with Express routes.
 *
 * @example
 * ```typescript
 * import { supplierController } from '@/controllers/supplier.controller.js';
 *
 * router.get('/', supplierController.getSuppliers);
 * router.post('/', supplierController.createSupplier);
 * ```
 */
class SupplierController {
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

  // ==========================================================================
  // GET HANDLERS
  // ==========================================================================

  /**
   * Get all suppliers for authenticated user with optional filters.
   *
   * @route GET /api/v1/admin/suppliers
   * @query search - Optional search keyword
   */
  getSuppliers = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const search = req.query.search as string | undefined;

      const suppliers = await supplierService.getSuppliers(userId, { search });
      res.json({ suppliers });
    } catch (error) {
      this.handleError(error, res, 'fetch suppliers');
    }
  };

  /**
   * Get single supplier by ID.
   *
   * @route GET /api/v1/admin/suppliers/:id
   * @param id - Supplier ID
   */
  getSupplierById = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const supplierId = req.params.id;

      if (!supplierId) {
        res.status(400).json({ error: 'Supplier ID is required' });
        return;
      }

      const supplier = await supplierService.getSupplierById(supplierId, userId);
      res.json(supplier);
    } catch (error) {
      this.handleError(error, res, 'fetch supplier');
    }
  };

  /**
   * Get all supplier names for dropdown.
   *
   * @route GET /api/v1/admin/suppliers/names
   */
  getSupplierNames = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const names = await supplierService.getSupplierNames(userId);
      res.json({ names });
    } catch (error) {
      this.handleError(error, res, 'fetch supplier names');
    }
  };

  // ==========================================================================
  // CREATE / UPDATE / DELETE HANDLERS
  // ==========================================================================

  /**
   * Create new supplier.
   *
   * @route POST /api/v1/admin/suppliers
   * @body name - Supplier name (2-100 chars)
   * @body contactPerson - Contact person name (2-100 chars)
   * @body email - Contact email
   * @body phone - Contact phone
   * @body address - Optional address
   */
  createSupplier = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const supplier = await supplierService.createSupplier(userId, req.body);
      res.status(201).json(supplier);
    } catch (error) {
      this.handleError(error, res, 'create supplier');
    }
  };

  /**
   * Update supplier.
   *
   * @route PUT /api/v1/admin/suppliers/:id
   * @param id - Supplier ID
   * @body name - Optional updated name
   * @body contactPerson - Optional updated contact person
   * @body email - Optional updated email
   * @body phone - Optional updated phone
   * @body address - Optional updated address
   */
  updateSupplier = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const supplierId = req.params.id;

      if (!supplierId) {
        res.status(400).json({ error: 'Supplier ID is required' });
        return;
      }

      const supplier = await supplierService.updateSupplier(supplierId, userId, req.body);
      res.json(supplier);
    } catch (error) {
      this.handleError(error, res, 'update supplier');
    }
  };

  /**
   * Delete supplier.
   *
   * @route DELETE /api/v1/admin/suppliers/:id
   * @param id - Supplier ID
   */
  deleteSupplier = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const supplierId = req.params.id;

      if (!supplierId) {
        res.status(400).json({ error: 'Supplier ID is required' });
        return;
      }

      await supplierService.deleteSupplier(supplierId, userId);
      res.status(204).send();
    } catch (error) {
      this.handleError(error, res, 'delete supplier');
    }
  };
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

/**
 * Singleton instance of SupplierController.
 * Use this instance in route definitions.
 *
 * @example
 * ```typescript
 * router.get('/', supplierController.getSuppliers);
 * ```
 */
export const supplierController = new SupplierController();