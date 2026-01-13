/**
 * Supplier Controller
 *
 * HTTP request handlers for supplier operations.
 * Handles validation, calls repository, and formats responses.
 *
 * @module controllers/supplier.controller
 */

import type { Request, Response } from 'express';
import { supplierRepo } from '@/repos/supplier.repo.js';
import {
  toSupplierResponse,
  type CreateSupplierInput,
  type UpdateSupplierInput,
  type SupplierFilterOptions,
} from '@/models/supplier.model.js';
import { logger } from '@/utils/logger.util.js';

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Simple email validation regex
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

// ============================================================================
// GET HANDLERS
// ============================================================================

/**
 * Get all suppliers for authenticated user with optional filters
 * GET /api/v1/user/suppliers?search=keyword
 */
export const getSuppliers = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.id;

    // Parse query parameters
    const searchParam = req.query.search as string | undefined;

    // Build filter options
    const filterOptions: SupplierFilterOptions = { userId };

    if (searchParam) {
      filterOptions.search = searchParam;
    }

    const suppliers = await supplierRepo.findMany(filterOptions);
    const response = suppliers.map(toSupplierResponse);

    res.json({ suppliers: response });
  } catch (error) {
    logger.error('Error fetching suppliers', {
      error: error instanceof Error ? error.message : String(error),
      userId: req.user?.id,
    });
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
};

/**
 * Get single supplier by ID
 * GET /api/v1/user/suppliers/:id
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

    const supplier = await supplierRepo.findById(supplierId, userId);

    if (!supplier) {
      res.status(404).json({ error: 'Supplier not found' });
      return;
    }

    res.json(toSupplierResponse(supplier));
  } catch (error) {
    logger.error('Error fetching supplier', {
      error: error instanceof Error ? error.message : String(error),
      supplierId: req.params.id,
      userId: req.user?.id,
    });
    res.status(500).json({ error: 'Failed to fetch supplier' });
  }
};

/**
 * Get all supplier names for dropdown
 * GET /api/v1/user/suppliers/names
 */
export const getSupplierNames = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const names = await supplierRepo.getNames(userId);

    res.json({ names });
  } catch (error) {
    logger.error('Error fetching supplier names', {
      error: error instanceof Error ? error.message : String(error),
      userId: req.user?.id,
    });
    res.status(500).json({ error: 'Failed to fetch supplier names' });
  }
};

// ============================================================================
// CREATE / UPDATE / DELETE HANDLERS
// ============================================================================

/**
 * Create new supplier
 * POST /api/v1/user/suppliers
 */
export const createSupplier = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const input: CreateSupplierInput = req.body;

    // Validate name
    if (!input.name || input.name.trim().length === 0) {
      res.status(400).json({ error: 'Supplier name is required' });
      return;
    }
    if (input.name.trim().length < 2) {
      res.status(400).json({ error: 'Supplier name must be at least 2 characters' });
      return;
    }
    if (input.name.trim().length > 100) {
      res.status(400).json({ error: 'Supplier name must not exceed 100 characters' });
      return;
    }

    // Validate contact person
    if (!input.contactPerson || input.contactPerson.trim().length === 0) {
      res.status(400).json({ error: 'Contact person is required' });
      return;
    }
    if (input.contactPerson.trim().length < 2) {
      res.status(400).json({ error: 'Contact person must be at least 2 characters' });
      return;
    }
    if (input.contactPerson.trim().length > 100) {
      res.status(400).json({ error: 'Contact person must not exceed 100 characters' });
      return;
    }

    // Validate email
    if (!input.email || input.email.trim().length === 0) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }
    if (!isValidEmail(input.email.trim())) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }

    // Validate phone
    if (!input.phone || input.phone.trim().length === 0) {
      res.status(400).json({ error: 'Phone is required' });
      return;
    }

    const supplier = await supplierRepo.create(userId, input);

    logger.info('Supplier created', {
      supplierId: supplier._id.toString(),
      userId,
    });

    res.status(201).json(toSupplierResponse(supplier));
  } catch (error) {
    logger.error('Error creating supplier', {
      error: error instanceof Error ? error.message : String(error),
      userId: req.user?.id,
    });
    res.status(500).json({ error: 'Failed to create supplier' });
  }
};

/**
 * Update supplier
 * PUT /api/v1/user/suppliers/:id
 */
export const updateSupplier = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const supplierId = req.params.id;
    const input: UpdateSupplierInput = req.body;

    if (!supplierId) {
      res.status(400).json({ error: 'Supplier ID is required' });
      return;
    }

    // Validate name if being updated
    if (input.name !== undefined) {
      if (input.name.trim().length === 0) {
        res.status(400).json({ error: 'Supplier name cannot be empty' });
        return;
      }
      if (input.name.trim().length < 2) {
        res.status(400).json({ error: 'Supplier name must be at least 2 characters' });
        return;
      }
      if (input.name.trim().length > 100) {
        res.status(400).json({ error: 'Supplier name must not exceed 100 characters' });
        return;
      }
    }

    // Validate contact person if being updated
    if (input.contactPerson !== undefined) {
      if (input.contactPerson.trim().length === 0) {
        res.status(400).json({ error: 'Contact person cannot be empty' });
        return;
      }
      if (input.contactPerson.trim().length < 2) {
        res.status(400).json({ error: 'Contact person must be at least 2 characters' });
        return;
      }
      if (input.contactPerson.trim().length > 100) {
        res.status(400).json({ error: 'Contact person must not exceed 100 characters' });
        return;
      }
    }

    // Validate email if being updated
    if (input.email !== undefined) {
      if (input.email.trim().length === 0) {
        res.status(400).json({ error: 'Email cannot be empty' });
        return;
      }
      if (!isValidEmail(input.email.trim())) {
        res.status(400).json({ error: 'Invalid email format' });
        return;
      }
    }

    // Validate phone if being updated
    if (input.phone !== undefined) {
      if (input.phone.trim().length === 0) {
        res.status(400).json({ error: 'Phone cannot be empty' });
        return;
      }
    }

    const supplier = await supplierRepo.update(supplierId, userId, input);

    if (!supplier) {
      res.status(404).json({ error: 'Supplier not found' });
      return;
    }

    logger.info('Supplier updated', { supplierId, userId });

    res.json(toSupplierResponse(supplier));
  } catch (error) {
    logger.error('Error updating supplier', {
      error: error instanceof Error ? error.message : String(error),
      supplierId: req.params.id,
      userId: req.user?.id,
    });
    res.status(500).json({ error: 'Failed to update supplier' });
  }
};

/**
 * Delete supplier
 * DELETE /api/v1/user/suppliers/:id
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

    const deleted = await supplierRepo.delete(supplierId, userId);

    if (!deleted) {
      res.status(404).json({ error: 'Supplier not found' });
      return;
    }

    logger.info('Supplier deleted', { supplierId, userId });

    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting supplier', {
      error: error instanceof Error ? error.message : String(error),
      supplierId: req.params.id,
      userId: req.user?.id,
    });
    res.status(500).json({ error: 'Failed to delete supplier' });
  }
};