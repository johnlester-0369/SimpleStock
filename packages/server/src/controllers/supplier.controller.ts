/**
 * Supplier Controller
 *
 * HTTP request handlers for supplier operations.
 * Delegates business logic to SupplierService.
 *
 * @module controllers/supplier.controller
 */

import type { Request, Response } from 'express';
import { supplierService } from '@/services/supplier.service.js';
import { isDomainError } from '@/shared/errors.js';
import { logger } from '@/utils/logger.util.js';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Handle domain errors and send appropriate HTTP response
 */
function handleError(error: unknown, res: Response, context: string): void {
  if (isDomainError(error)) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  logger.error(`Error in ${context}`, {
    error: error instanceof Error ? error.message : String(error),
  });
  res.status(500).json({ error: `Failed to ${context.toLowerCase()}` });
}

// ============================================================================
// GET HANDLERS
// ============================================================================

/**
 * Get all suppliers for authenticated user with optional filters
 * GET /api/v1/admin/suppliers?search=keyword
 */
export const getSuppliers = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const search = req.query.search as string | undefined;

    const suppliers = await supplierService.getSuppliers(userId, { search });
    res.json({ suppliers });
  } catch (error) {
    handleError(error, res, 'fetch suppliers');
  }
};

/**
 * Get single supplier by ID
 * GET /api/v1/admin/suppliers/:id
 */
export const getSupplierById = async (
  req: Request,
  res: Response,
): Promise<void> => {
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
    handleError(error, res, 'fetch supplier');
  }
};

/**
 * Get all supplier names for dropdown
 * GET /api/v1/admin/suppliers/names
 */
export const getSupplierNames = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const names = await supplierService.getSupplierNames(userId);
    res.json({ names });
  } catch (error) {
    handleError(error, res, 'fetch supplier names');
  }
};

// ============================================================================
// CREATE / UPDATE / DELETE HANDLERS
// ============================================================================

/**
 * Create new supplier
 * POST /api/v1/admin/suppliers
 */
export const createSupplier = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    // Pass raw body - service handles validation with Zod
    const supplier = await supplierService.createSupplier(userId, req.body);
    res.status(201).json(supplier);
  } catch (error) {
    handleError(error, res, 'create supplier');
  }
};

/**
 * Update supplier
 * PUT /api/v1/admin/suppliers/:id
 */
export const updateSupplier = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const supplierId = req.params.id;

    if (!supplierId) {
      res.status(400).json({ error: 'Supplier ID is required' });
      return;
    }

    // Pass raw body - service handles validation with Zod
    const supplier = await supplierService.updateSupplier(supplierId, userId, req.body);
    res.json(supplier);
  } catch (error) {
    handleError(error, res, 'update supplier');
  }
};

/**
 * Delete supplier
 * DELETE /api/v1/admin/suppliers/:id
 */
export const deleteSupplier = async (
  req: Request,
  res: Response,
): Promise<void> => {
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
    handleError(error, res, 'delete supplier');
  }
};