import React, { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import PageHead from '@/components/common/PageHead'
import Table from '@/components/ui/Table'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Dialog from '@/components/ui/Dialog'
import Card from '@/components/ui/Card'
import Alert from '@/components/ui/Alert'
import Dropdown from '@/components/ui/Dropdown'
import EmptyState from '@/components/ui/EmptyState'
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ShoppingCart,
  Package,
  AlertTriangle,
  Filter,
} from 'lucide-react'
import { cn } from '@/utils/cn.util'
import {
  validateForm,
  productSchema,
  createSellProductSchema,
  type ProductFormData as ZodProductFormData,
} from '@/utils/validation.util'

/**
 * Product interface defining the structure of a product item
 */
interface Product {
  id: string
  name: string
  price: number
  stockQuantity: number
  supplier: string
}

/**
 * Form data interface for add/edit operations (string values for form inputs)
 */
interface ProductFormState {
  name: string
  price: string
  stockQuantity: string
  supplier: string
}

/**
 * Initial mock data for products
 * Includes various stock levels to demonstrate low stock highlighting
 */
const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Wireless Mouse',
    price: 29.99,
    stockQuantity: 45,
    supplier: 'TechCorp',
  },
  {
    id: '2',
    name: 'USB-C Cable',
    price: 12.99,
    stockQuantity: 3,
    supplier: 'CableMax',
  },
  {
    id: '3',
    name: 'Mechanical Keyboard',
    price: 89.99,
    stockQuantity: 12,
    supplier: 'TechCorp',
  },
  {
    id: '4',
    name: 'Monitor Stand',
    price: 49.99,
    stockQuantity: 2,
    supplier: 'OfficeGear',
  },
  {
    id: '5',
    name: 'Webcam HD',
    price: 59.99,
    stockQuantity: 28,
    supplier: 'TechCorp',
  },
  {
    id: '6',
    name: 'USB Hub 7-Port',
    price: 24.99,
    stockQuantity: 4,
    supplier: 'CableMax',
  },
  {
    id: '7',
    name: 'Laptop Stand Aluminum',
    price: 39.99,
    stockQuantity: 15,
    supplier: 'OfficeGear',
  },
  {
    id: '8',
    name: 'LED Desk Lamp',
    price: 34.99,
    stockQuantity: 8,
    supplier: 'LightWorks',
  },
  {
    id: '9',
    name: 'Mousepad XL Gaming',
    price: 19.99,
    stockQuantity: 52,
    supplier: 'GamerZone',
  },
  {
    id: '10',
    name: 'Headphone Stand Wood',
    price: 22.99,
    stockQuantity: 1,
    supplier: 'OfficeGear',
  },
  {
    id: '11',
    name: 'Wireless Charger Pad',
    price: 35.99,
    stockQuantity: 33,
    supplier: 'TechCorp',
  },
  {
    id: '12',
    name: 'Cable Management Kit',
    price: 15.99,
    stockQuantity: 0,
    supplier: 'CableMax',
  },
  {
    id: '13',
    name: 'Ergonomic Chair Mat',
    price: 45.99,
    stockQuantity: 7,
    supplier: 'OfficeGear',
  },
  {
    id: '14',
    name: 'Bluetooth Speaker Mini',
    price: 55.99,
    stockQuantity: 19,
    supplier: 'SoundMax',
  },
  {
    id: '15',
    name: 'Screen Cleaner Kit',
    price: 8.99,
    stockQuantity: 64,
    supplier: 'CleanTech',
  },
]

/** Number of items to display per page */
const ITEMS_PER_PAGE = 8

/** Stock quantity threshold for low stock warning */
const LOW_STOCK_THRESHOLD = 5

/** Initial empty form state */
const EMPTY_FORM: ProductFormState = {
  name: '',
  price: '',
  stockQuantity: '',
  supplier: '',
}

/** Stock filter options */
const STOCK_FILTER_OPTIONS = [
  { value: 'all', label: 'All Stock Levels' },
  { value: 'in-stock', label: 'In Stock (≥5)' },
  { value: 'low-stock', label: 'Low Stock (1-4)' },
  { value: 'out-of-stock', label: 'Out of Stock (0)' },
]

/**
 * Supplier options for product form Dropdown
 * Hardcoded based on suppliers from settings/supplier page
 */
const SUPPLIER_OPTIONS = [
  { value: 'TechCorp', label: 'TechCorp' },
  { value: 'CableMax', label: 'CableMax' },
  { value: 'OfficeGear', label: 'OfficeGear' },
  { value: 'LightWorks', label: 'LightWorks' },
  { value: 'GamerZone', label: 'GamerZone' },
  { value: 'SoundMax', label: 'SoundMax' },
  { value: 'CleanTech', label: 'CleanTech' },
]

/**
 * ProductsPage Component
 *
 * A complete products management page featuring:
 * - Product table with Name, Price, Stock Quantity, Supplier columns
 * - Horizontal scrolling table for responsive design
 * - Search/filter by name or supplier
 * - Dropdown filters for stock status and supplier
 * - URL parameter support for pre-filtering (e.g., ?filter=low-stock)
 * - Pagination (8 items per page) using Table.Pagination
 * - Add, Edit, Delete product dialogs
 * - Sell product functionality
 * - Low stock highlighting (<5 items)
 * - EmptyState component for empty results
 * - Dropdown for supplier selection
 * - Zod validation for all forms
 */
const ProductsPage: React.FC = () => {
  // URL search params for filter navigation (supports dashboard links)
  const [searchParams] = useSearchParams()

  // Products state
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Filter states
  const [stockFilter, setStockFilter] = useState('all')
  const [supplierFilter, setSupplierFilter] = useState('all')

  // Dialog visibility states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isSellDialogOpen, setIsSellDialogOpen] = useState(false)

  // Selected product for edit/delete/sell operations
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  // Form states
  const [formData, setFormData] = useState<ProductFormState>(EMPTY_FORM)
  const [sellQuantity, setSellQuantity] = useState('1')
  const [formError, setFormError] = useState('')

  // Sync stock filter from URL params (supports dashboard "View All" links)
  useEffect(() => {
    const filterParam = searchParams.get('filter')
    const validFilterValues = STOCK_FILTER_OPTIONS.map((opt) => opt.value)
    if (filterParam && validFilterValues.includes(filterParam)) {
      setStockFilter(filterParam)
    }
  }, [searchParams])

  // Generate supplier filter options dynamically from products
  const supplierFilterOptions = useMemo(() => {
    const uniqueSuppliers = [...new Set(products.map((p) => p.supplier))].sort()
    return [
      { value: 'all', label: 'All Suppliers' },
      ...uniqueSuppliers.map((supplier) => ({
        value: supplier,
        label: supplier,
      })),
    ]
  }, [products])

  // Filter products based on search query and dropdown filters
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Search filter (by name or supplier)
      const query = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.supplier.toLowerCase().includes(query)

      // Stock status filter
      let matchesStockFilter = true
      if (stockFilter === 'in-stock') {
        matchesStockFilter = product.stockQuantity >= LOW_STOCK_THRESHOLD
      } else if (stockFilter === 'low-stock') {
        matchesStockFilter =
          product.stockQuantity > 0 &&
          product.stockQuantity < LOW_STOCK_THRESHOLD
      } else if (stockFilter === 'out-of-stock') {
        matchesStockFilter = product.stockQuantity === 0
      }

      // Supplier filter
      const matchesSupplierFilter =
        supplierFilter === 'all' || product.supplier === supplierFilter

      return matchesSearch && matchesStockFilter && matchesSupplierFilter
    })
  }, [products, searchQuery, stockFilter, supplierFilter])

  // Paginated products for display
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredProducts, currentPage])

  // Count low stock items in filtered results
  const lowStockCount = useMemo(
    () =>
      filteredProducts.filter((p) => p.stockQuantity < LOW_STOCK_THRESHOLD)
        .length,
    [filteredProducts],
  )

  // Check if any filters are active
  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    stockFilter !== 'all' ||
    supplierFilter !== 'all'

  // Reset to first page when search or filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, stockFilter, supplierFilter])

  /**
   * Reset form to initial empty state
   */
  const resetForm = () => {
    setFormData(EMPTY_FORM)
    setFormError('')
  }

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    setSearchQuery('')
    setStockFilter('all')
    setSupplierFilter('all')
  }

  /**
   * Validate product form data using Zod
   * @returns Validated data or null if validation fails
   */
  const validateProductForm = (): ZodProductFormData | null => {
    const validation = validateForm(productSchema, {
      name: formData.name.trim(),
      price: formData.price,
      stockQuantity: formData.stockQuantity,
      supplier: formData.supplier,
    })

    if (!validation.success) {
      setFormError(validation.error || 'Validation failed')
      return null
    }

    setFormError('')
    return validation.data as ZodProductFormData
  }

  /**
   * Handle adding a new product
   */
  const handleAddProduct = () => {
    const validatedData = validateProductForm()
    if (!validatedData) return

    const newProduct: Product = {
      id: `product-${Date.now()}`,
      name: validatedData.name,
      price: validatedData.price,
      stockQuantity: validatedData.stockQuantity,
      supplier: validatedData.supplier,
    }

    setProducts((prev) => [...prev, newProduct])
    setIsAddDialogOpen(false)
    resetForm()
  }

  /**
   * Open edit dialog with selected product data
   */
  const openEditDialog = (product: Product) => {
    setSelectedProduct(product)
    setFormData({
      name: product.name,
      price: String(product.price),
      stockQuantity: String(product.stockQuantity),
      supplier: product.supplier,
    })
    setFormError('')
    setIsEditDialogOpen(true)
  }

  /**
   * Handle editing an existing product
   */
  const handleEditProduct = () => {
    if (!selectedProduct) return

    const validatedData = validateProductForm()
    if (!validatedData) return

    setProducts((prev) =>
      prev.map((p) =>
        p.id === selectedProduct.id
          ? {
              ...p,
              name: validatedData.name,
              price: validatedData.price,
              stockQuantity: validatedData.stockQuantity,
              supplier: validatedData.supplier,
            }
          : p,
      ),
    )
    setIsEditDialogOpen(false)
    setSelectedProduct(null)
    resetForm()
  }

  /**
   * Open delete confirmation dialog
   */
  const openDeleteDialog = (product: Product) => {
    setSelectedProduct(product)
    setIsDeleteDialogOpen(true)
  }

  /**
   * Handle deleting a product
   */
  const handleDeleteProduct = () => {
    if (!selectedProduct) return

    setProducts((prev) => prev.filter((p) => p.id !== selectedProduct.id))
    setIsDeleteDialogOpen(false)
    setSelectedProduct(null)
  }

  /**
   * Open sell dialog for a product
   */
  const openSellDialog = (product: Product) => {
    setSelectedProduct(product)
    setSellQuantity('1')
    setFormError('')
    setIsSellDialogOpen(true)
  }

  /**
   * Handle selling a product (reducing stock) with Zod validation
   */
  const handleSellProduct = () => {
    if (!selectedProduct) return

    // Create dynamic schema with max quantity
    const sellSchema = createSellProductSchema(selectedProduct.stockQuantity)
    const validation = validateForm(sellSchema, { quantity: sellQuantity })

    if (!validation.success) {
      setFormError(validation.error || 'Validation failed')
      return
    }

    const quantity = validation.data?.quantity as number

    setProducts((prev) =>
      prev.map((p) =>
        p.id === selectedProduct.id
          ? { ...p, stockQuantity: p.stockQuantity - quantity }
          : p,
      ),
    )
    setIsSellDialogOpen(false)
    setSelectedProduct(null)
    setSellQuantity('1')
    setFormError('')
  }

  /**
   * Format price as USD currency
   */
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  /**
   * Check if stock quantity is considered low
   */
  const isLowStock = (quantity: number): boolean =>
    quantity < LOW_STOCK_THRESHOLD

  /**
   * Handle form field changes for Input components
   */
  const handleFormChange =
    (field: keyof ProductFormState) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }))
      if (formError) setFormError('')
    }

  /**
   * Handle supplier Dropdown change
   * Dropdown onChange returns value directly, not an event
   */
  const handleSupplierChange = (value: string) => {
    setFormData((prev) => ({ ...prev, supplier: value }))
    if (formError) setFormError('')
  }

  /**
   * Close add dialog and reset form
   */
  const handleCloseAddDialog = (open: boolean) => {
    setIsAddDialogOpen(open)
    if (!open) resetForm()
  }

  /**
   * Close edit dialog and reset state
   */
  const handleCloseEditDialog = (open: boolean) => {
    setIsEditDialogOpen(open)
    if (!open) {
      setSelectedProduct(null)
      resetForm()
    }
  }

  /**
   * Close delete dialog and reset state
   */
  const handleCloseDeleteDialog = (open: boolean) => {
    setIsDeleteDialogOpen(open)
    if (!open) setSelectedProduct(null)
  }

  /**
   * Close sell dialog and reset state
   */
  const handleCloseSellDialog = (open: boolean) => {
    setIsSellDialogOpen(open)
    if (!open) {
      setSelectedProduct(null)
      setSellQuantity('1')
      setFormError('')
    }
  }

  return (
    <>
      <PageHead
        title="Products"
        description="Manage your product inventory, add new products, and track stock levels."
      />

      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-headline">Products</h1>
            <p className="mt-1 text-muted">
              Manage your product inventory and stock levels.
            </p>
          </div>

          {/* Add Product Button */}
          <Dialog.Root
            open={isAddDialogOpen}
            onOpenChange={handleCloseAddDialog}
          >
            <Dialog.Trigger asChild>
              <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
                Add Product
              </Button>
            </Dialog.Trigger>

            <Dialog.Positioner>
              <Dialog.Backdrop />
              <Dialog.Content size="md">
                <Dialog.Header>
                  <Dialog.Title>Add New Product</Dialog.Title>
                  <Dialog.CloseTrigger />
                </Dialog.Header>

                <Dialog.Body>
                  <div className="space-y-4">
                    {formError && (
                      <Alert
                        variant="error"
                        title={formError}
                        onClose={() => setFormError('')}
                      />
                    )}

                    <Input
                      label="Product Name"
                      placeholder="Enter product name"
                      value={formData.name}
                      onChange={handleFormChange('name')}
                    />

                    <Input
                      label="Price ($)"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={handleFormChange('price')}
                    />

                    <Input
                      label="Stock Quantity"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formData.stockQuantity}
                      onChange={handleFormChange('stockQuantity')}
                    />

                    <Dropdown
                      label="Supplier"
                      options={SUPPLIER_OPTIONS}
                      value={formData.supplier}
                      onChange={handleSupplierChange}
                      placeholder="Select a supplier"
                      size="md"
                      fullWidth
                    />
                  </div>
                </Dialog.Body>

                <Dialog.Footer>
                  <Button
                    variant="ghost"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={handleAddProduct}>
                    Add Product
                  </Button>
                </Dialog.Footer>
              </Dialog.Content>
            </Dialog.Positioner>
          </Dialog.Root>
        </div>

        {/* Search and Filter Bar */}
        <Card.Root padding="md">
          <div className="space-y-4">
            {/* Search Input */}
            <div className="flex-1">
              <Input
                placeholder="Search by product name or supplier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="h-5 w-5" />}
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2 text-sm text-muted shrink-0">
                <Filter className="h-4 w-4" />
                <span>Filters:</span>
              </div>

              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Dropdown
                  options={STOCK_FILTER_OPTIONS}
                  value={stockFilter}
                  onChange={setStockFilter}
                  placeholder="Filter by stock"
                  size="md"
                  fullWidth
                />

                <Dropdown
                  options={supplierFilterOptions}
                  value={supplierFilter}
                  onChange={setSupplierFilter}
                  placeholder="Filter by supplier"
                  size="md"
                  fullWidth
                />
              </div>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="md"
                  onClick={clearFilters}
                  className="shrink-0"
                >
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Stats Row */}
            <div className="flex items-center gap-4 text-sm text-muted pt-2 border-t border-divider">
              <span>
                {filteredProducts.length}{' '}
                {filteredProducts.length === 1 ? 'product' : 'products'}
                {hasActiveFilters && ' (filtered)'}
              </span>
              {lowStockCount > 0 && (
                <span className="flex items-center gap-1.5 text-warning">
                  <AlertTriangle className="h-4 w-4" />
                  {lowStockCount} low stock
                </span>
              )}
            </div>
          </div>
        </Card.Root>

        {/* Products Table or EmptyState */}
        {filteredProducts.length === 0 ? (
          <EmptyState
            icon={Package}
            title={hasActiveFilters ? 'No products found' : 'No products yet'}
            description={
              hasActiveFilters
                ? "Try adjusting your search terms or filters to find what you're looking for."
                : 'Get started by adding your first product to the inventory.'
            }
            action={
              hasActiveFilters
                ? {
                    label: 'Clear Filters',
                    onClick: clearFilters,
                    icon: <Filter className="h-4 w-4" />,
                  }
                : {
                    label: 'Add Product',
                    onClick: () => setIsAddDialogOpen(true),
                    icon: <Plus className="h-4 w-4" />,
                  }
            }
          />
        ) : (
          <>
            {/* Products Table with Horizontal Scroll */}
            <Table.ScrollArea>
              <Table.Root variant="default" size="md" hoverable stickyHeader>
                <Table.Header>
                  <Table.Row disableHover>
                    <Table.Head>Name</Table.Head>
                    <Table.Head align="right">Price</Table.Head>
                    <Table.Head align="right">Stock</Table.Head>
                    <Table.Head>Supplier</Table.Head>
                    <Table.Head align="center">Actions</Table.Head>
                  </Table.Row>
                </Table.Header>

                <Table.Body>
                  {paginatedProducts.map((product) => (
                    <Table.Row
                      key={product.id}
                      className={cn(
                        isLowStock(product.stockQuantity) && 'bg-warning/5',
                      )}
                    >
                      <Table.Cell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-headline whitespace-nowrap">
                            {product.name}
                          </span>
                          {isLowStock(product.stockQuantity) && (
                            <AlertTriangle
                              className="h-4 w-4 text-warning shrink-0"
                              aria-label="Low stock"
                            />
                          )}
                        </div>
                      </Table.Cell>
                      <Table.Cell align="right" className="whitespace-nowrap">
                        {formatPrice(product.price)}
                      </Table.Cell>
                      <Table.Cell align="right">
                        <span
                          className={cn(
                            'font-medium',
                            product.stockQuantity === 0
                              ? 'text-error'
                              : isLowStock(product.stockQuantity)
                                ? 'text-warning'
                                : 'text-text',
                          )}
                        >
                          {product.stockQuantity}
                        </span>
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap">
                        {product.supplier}
                      </Table.Cell>
                      <Table.Cell align="center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<ShoppingCart className="h-4 w-4" />}
                            onClick={() => openSellDialog(product)}
                            disabled={product.stockQuantity === 0}
                            aria-label={`Sell ${product.name}`}
                          >
                            Sell
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Pencil className="h-4 w-4" />}
                            onClick={() => openEditDialog(product)}
                            aria-label={`Edit ${product.name}`}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Trash2 className="h-4 w-4" />}
                            onClick={() => openDeleteDialog(product)}
                            className="text-error hover:text-error hover:bg-error/10"
                            aria-label={`Delete ${product.name}`}
                          >
                            Delete
                          </Button>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Table.ScrollArea>

            {/* Pagination using Table.Pagination */}
            <Table.Pagination
              currentPage={currentPage}
              totalItems={filteredProducts.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
              showInfo
              itemLabel="products"
            />
          </>
        )}
      </div>

      {/* Edit Product Dialog */}
      <Dialog.Root open={isEditDialogOpen} onOpenChange={handleCloseEditDialog}>
        <Dialog.Positioner>
          <Dialog.Backdrop />
          <Dialog.Content size="md">
            <Dialog.Header>
              <Dialog.Title>Edit Product</Dialog.Title>
              <Dialog.CloseTrigger />
            </Dialog.Header>

            <Dialog.Body>
              <div className="space-y-4">
                {formError && (
                  <Alert
                    variant="error"
                    title={formError}
                    onClose={() => setFormError('')}
                  />
                )}

                <Input
                  label="Product Name"
                  placeholder="Enter product name"
                  value={formData.name}
                  onChange={handleFormChange('name')}
                />

                <Input
                  label="Price ($)"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={handleFormChange('price')}
                />

                <Input
                  label="Stock Quantity"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.stockQuantity}
                  onChange={handleFormChange('stockQuantity')}
                />

                <Dropdown
                  label="Supplier"
                  options={SUPPLIER_OPTIONS}
                  value={formData.supplier}
                  onChange={handleSupplierChange}
                  placeholder="Select a supplier"
                  size="md"
                  fullWidth
                />
              </div>
            </Dialog.Body>

            <Dialog.Footer>
              <Button
                variant="ghost"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" onClick={handleEditProduct}>
                Save Changes
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>

      {/* Delete Confirmation Dialog */}
      <Dialog.Root
        open={isDeleteDialogOpen}
        onOpenChange={handleCloseDeleteDialog}
      >
        <Dialog.Positioner>
          <Dialog.Backdrop />
          <Dialog.Content size="sm">
            <Dialog.Header>
              <Dialog.Title>Delete Product</Dialog.Title>
              <Dialog.CloseTrigger />
            </Dialog.Header>

            <Dialog.Body>
              <p className="text-text">
                Are you sure you want to delete{' '}
                <span className="font-semibold text-headline">
                  {selectedProduct?.name}
                </span>
                ? This action cannot be undone.
              </p>
            </Dialog.Body>

            <Dialog.Footer>
              <Button
                variant="ghost"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDeleteProduct}>
                Delete Product
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>

      {/* Sell Product Dialog */}
      <Dialog.Root open={isSellDialogOpen} onOpenChange={handleCloseSellDialog}>
        <Dialog.Positioner>
          <Dialog.Backdrop />
          <Dialog.Content size="sm">
            <Dialog.Header>
              <Dialog.Title>Sell Product</Dialog.Title>
              <Dialog.CloseTrigger />
            </Dialog.Header>

            <Dialog.Body>
              <div className="space-y-4">
                {formError && (
                  <Alert
                    variant="error"
                    title={formError}
                    onClose={() => setFormError('')}
                  />
                )}

                <div className="p-4 bg-surface-1 rounded-lg">
                  <p className="font-medium text-headline">
                    {selectedProduct?.name}
                  </p>
                  <div className="flex items-center justify-between mt-2 text-sm">
                    <span className="text-muted">Unit Price:</span>
                    <span className="font-medium">
                      {selectedProduct && formatPrice(selectedProduct.price)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-sm">
                    <span className="text-muted">Available Stock:</span>
                    <span
                      className={cn(
                        'font-medium',
                        selectedProduct &&
                          isLowStock(selectedProduct.stockQuantity) &&
                          'text-warning',
                      )}
                    >
                      {selectedProduct?.stockQuantity} units
                    </span>
                  </div>
                </div>

                <Input
                  label="Quantity to Sell"
                  type="number"
                  min="1"
                  max={selectedProduct?.stockQuantity}
                  placeholder="1"
                  value={sellQuantity}
                  onChange={(e) => {
                    setSellQuantity(e.target.value)
                    if (formError) setFormError('')
                  }}
                />

                {selectedProduct && parseInt(sellQuantity, 10) > 0 && (
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <p className="text-sm text-muted">Total Sale Amount</p>
                    <p className="text-2xl font-bold text-primary mt-1">
                      {formatPrice(
                        selectedProduct.price *
                          parseInt(sellQuantity || '0', 10),
                      )}
                    </p>
                  </div>
                )}
              </div>
            </Dialog.Body>

            <Dialog.Footer>
              <Button
                variant="ghost"
                onClick={() => setIsSellDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                leftIcon={<ShoppingCart className="h-4 w-4" />}
                onClick={handleSellProduct}
              >
                Confirm Sale
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </>
  )
}

export default ProductsPage