import React, { useState, useMemo, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import PageHead from '@/components/common/PageHead'
import Table from '@/components/ui/Table'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Dialog from '@/components/ui/Dialog'
import Card from '@/components/ui/Card'
import Alert from '@/components/ui/Alert'
import Dropdown from '@/components/ui/Dropdown'
import EmptyState from '@/components/ui/EmptyState'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ShoppingCart,
  Package,
  AlertTriangle,
  Filter,
  Truck,
} from 'lucide-react'
import { cn } from '@/utils/cn.util'

// Import hooks
import { useProducts } from '@/hooks/useProducts'
import { useProductMutations } from '@/hooks/useProductMutations'
import { useSuppliers } from '@/hooks/useSuppliers'
import type { Product } from '@/services/product.service'

// Import route constants
import { ROUTE_SETTINGS_SUPPLIER } from '@/constants/routes.constants'

/**
 * Form data interface for add/edit operations (string values for form inputs)
 */
interface ProductFormState {
  name: string
  price: string
  stockQuantity: string
  supplier: string
}

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
 * - No suppliers prompt when no suppliers exist
 * - Dynamic data from API via hooks
 */
const ProductsPage: React.FC = () => {
  // Navigation hook for redirecting
  const navigate = useNavigate()

  // URL search params for filter navigation (supports dashboard links)
  const [searchParams] = useSearchParams()

  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [stockFilter, setStockFilter] = useState<
    'all' | 'in-stock' | 'low-stock' | 'out-of-stock'
  >('all')
  const [supplierFilter, setSupplierFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Fetch products with filters
  const {
    products,
    stats,
    suppliers: productSuppliers,
    loading,
    error: fetchError,
    refetch,
  } = useProducts({
    search: searchQuery,
    stockStatus: stockFilter,
    supplier: supplierFilter,
  })

  // Fetch suppliers for dropdown (also get loading state)
  const { suppliers: supplierList, loading: suppliersLoading } = useSuppliers()

  // Mutation handlers
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const {
    isSubmitting,
    createProduct,
    updateProduct,
    sellProduct,
    deleteProduct,
  } = useProductMutations({
    onSuccess: (message) => {
      setSuccessMessage(message)
      setTimeout(() => setSuccessMessage(''), 3000)
      refetch()
    },
    onError: (message) => {
      setErrorMessage(message)
    },
  })

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
    const validFilterValues = ['all', 'in-stock', 'low-stock', 'out-of-stock']
    if (filterParam && validFilterValues.includes(filterParam)) {
      setStockFilter(
        filterParam as 'all' | 'in-stock' | 'low-stock' | 'out-of-stock',
      )
    }
  }, [searchParams])

  // Generate supplier filter options dynamically
  const supplierFilterOptions = useMemo(() => {
    const uniqueSuppliers = [
      ...new Set([...productSuppliers, ...supplierList.map((s) => s.name)]),
    ].sort()
    return [
      { value: '', label: 'All Suppliers' },
      ...uniqueSuppliers.map((supplier) => ({
        value: supplier,
        label: supplier,
      })),
    ]
  }, [productSuppliers, supplierList])

  // Supplier options for product form
  const supplierFormOptions = useMemo(() => {
    return supplierList.map((s) => ({
      value: s.name,
      label: s.name,
    }))
  }, [supplierList])

  // Paginated products for display
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return products.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [products, currentPage])

  // Count low stock items in current results
  const lowStockCount = useMemo(
    () =>
      products.filter((p) => p.stockQuantity < LOW_STOCK_THRESHOLD).length,
    [products],
  )

  // Check if any filters are active
  const hasActiveFilters =
    searchQuery.trim() !== '' || stockFilter !== 'all' || supplierFilter !== ''

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, stockFilter, supplierFilter])

  /**
   * Reset form to initial empty state
   */
  const resetForm = () => {
    setFormData(EMPTY_FORM)
    setFormError('')
    setErrorMessage('')
  }

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    setSearchQuery('')
    setStockFilter('all')
    setSupplierFilter('')
  }

  /**
   * Handle adding a new product - validation delegated to hook
   */
  const handleAddProduct = async () => {
    const price = parseFloat(formData.price)
    const stockQuantity = parseInt(formData.stockQuantity, 10)

    if (isNaN(price) || isNaN(stockQuantity)) {
      setFormError('Please enter valid numbers for price and stock quantity')
      return
    }

    const result = await createProduct({
      name: formData.name,
      price,
      stockQuantity,
      supplier: formData.supplier,
    })

    if (result) {
      setIsAddDialogOpen(false)
      resetForm()
    }
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
    setErrorMessage('')
    setIsEditDialogOpen(true)
  }

  /**
   * Handle editing an existing product - validation delegated to hook
   */
  const handleEditProduct = async () => {
    if (!selectedProduct) return

    const price = parseFloat(formData.price)
    const stockQuantity = parseInt(formData.stockQuantity, 10)

    if (isNaN(price) || isNaN(stockQuantity)) {
      setFormError('Please enter valid numbers for price and stock quantity')
      return
    }

    const result = await updateProduct(selectedProduct.id, {
      name: formData.name,
      price,
      stockQuantity,
      supplier: formData.supplier,
    })

    if (result) {
      setIsEditDialogOpen(false)
      setSelectedProduct(null)
      resetForm()
    }
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
  const handleDeleteProduct = async () => {
    if (!selectedProduct) return

    const success = await deleteProduct(selectedProduct.id)

    if (success) {
      setIsDeleteDialogOpen(false)
      setSelectedProduct(null)
    }
  }

  /**
   * Open sell dialog for a product
   */
  const openSellDialog = (product: Product) => {
    setSelectedProduct(product)
    setSellQuantity('1')
    setFormError('')
    setErrorMessage('')
    setIsSellDialogOpen(true)
  }

  /**
   * Handle selling a product (reducing stock) - validation delegated to hook
   */
  const handleSellProduct = async () => {
    if (!selectedProduct) return

    const quantity = parseInt(sellQuantity, 10)
    if (isNaN(quantity)) {
      setFormError('Please enter a valid quantity')
      return
    }

    // Pass available stock to hook for validation
    const result = await sellProduct(
      selectedProduct.id,
      quantity,
      selectedProduct.stockQuantity,
    )

    if (result) {
      setIsSellDialogOpen(false)
      setSelectedProduct(null)
      setSellQuantity('1')
      setFormError('')
    }
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
      if (errorMessage) setErrorMessage('')
    }

  /**
   * Handle supplier Dropdown change
   */
  const handleSupplierChange = (value: string) => {
    setFormData((prev) => ({ ...prev, supplier: value }))
    if (formError) setFormError('')
    if (errorMessage) setErrorMessage('')
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
      setErrorMessage('')
    }
  }

  /**
   * Navigate to supplier management page
   */
  const handleNavigateToSuppliers = () => {
    navigate(ROUTE_SETTINGS_SUPPLIER)
  }

  // Show loading spinner during initial load (products or suppliers)
  if (
    (loading && products.length === 0) ||
    (suppliersLoading && supplierList.length === 0)
  ) {
    return <LoadingSpinner />
  }

  // If no suppliers exist, show prompt to add suppliers first
  if (supplierList.length === 0) {
    return (
      <>
        <PageHead
          title="Products"
          description="Manage your product inventory, add new products, and track stock levels."
        />

        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-2xl font-bold text-headline">Products</h1>
            <p className="mt-1 text-muted">
              Manage your product inventory and stock levels.
            </p>
          </div>

          {/* No Suppliers Empty State */}
          <EmptyState
            icon={Truck}
            title="No suppliers yet"
            description="You must add a supplier before adding products."
            action={{
              label: 'Add Supplier',
              onClick: handleNavigateToSuppliers,
              icon: <Plus className="h-4 w-4" />,
            }}
          />
        </div>
      </>
    )
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
                    {(formError || errorMessage) && (
                      <Alert
                        variant="error"
                        title={formError || errorMessage}
                        onClose={() => {
                          setFormError('')
                          setErrorMessage('')
                        }}
                      />
                    )}

                    <Input
                      label="Product Name"
                      placeholder="Enter product name"
                      value={formData.name}
                      onChange={handleFormChange('name')}
                      disabled={isSubmitting}
                    />

                    <Input
                      label="Price ($)"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={handleFormChange('price')}
                      disabled={isSubmitting}
                    />

                    <Input
                      label="Stock Quantity"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formData.stockQuantity}
                      onChange={handleFormChange('stockQuantity')}
                      disabled={isSubmitting}
                    />

                    <Dropdown
                      label="Supplier"
                      options={supplierFormOptions}
                      value={formData.supplier}
                      onChange={handleSupplierChange}
                      placeholder="Select a supplier"
                      size="md"
                      fullWidth
                      disabled={isSubmitting}
                    />
                  </div>
                </Dialog.Body>

                <Dialog.Footer>
                  <Button
                    variant="ghost"
                    onClick={() => setIsAddDialogOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleAddProduct}
                    isLoading={isSubmitting}
                  >
                    Add Product
                  </Button>
                </Dialog.Footer>
              </Dialog.Content>
            </Dialog.Positioner>
          </Dialog.Root>
        </div>

        {/* Success Message */}
        {successMessage && (
          <Alert
            variant="success"
            title={successMessage}
            onClose={() => setSuccessMessage('')}
          />
        )}

        {/* Fetch Error */}
        {fetchError && (
          <Alert variant="error" title={fetchError} onClose={() => {}} />
        )}

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
                  onChange={(val) =>
                    setStockFilter(
                      val as 'all' | 'in-stock' | 'low-stock' | 'out-of-stock',
                    )
                  }
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
                {products.length}{' '}
                {products.length === 1 ? 'product' : 'products'}
                {hasActiveFilters && ' (filtered)'}
              </span>
              {lowStockCount > 0 && (
                <span className="flex items-center gap-1.5 text-warning">
                  <AlertTriangle className="h-4 w-4" />
                  {lowStockCount} low stock
                </span>
              )}
              {stats.totalValue > 0 && (
                <span>Total value: {formatPrice(stats.totalValue)}</span>
              )}
            </div>
          </div>
        </Card.Root>

        {/* Products Table or EmptyState */}
        {products.length === 0 ? (
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
              totalItems={products.length}
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
                {(formError || errorMessage) && (
                  <Alert
                    variant="error"
                    title={formError || errorMessage}
                    onClose={() => {
                      setFormError('')
                      setErrorMessage('')
                    }}
                  />
                )}

                <Input
                  label="Product Name"
                  placeholder="Enter product name"
                  value={formData.name}
                  onChange={handleFormChange('name')}
                  disabled={isSubmitting}
                />

                <Input
                  label="Price ($)"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={handleFormChange('price')}
                  disabled={isSubmitting}
                />

                <Input
                  label="Stock Quantity"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.stockQuantity}
                  onChange={handleFormChange('stockQuantity')}
                  disabled={isSubmitting}
                />

                <Dropdown
                  label="Supplier"
                  options={supplierFormOptions}
                  value={formData.supplier}
                  onChange={handleSupplierChange}
                  placeholder="Select a supplier"
                  size="md"
                  fullWidth
                  disabled={isSubmitting}
                />
              </div>
            </Dialog.Body>

            <Dialog.Footer>
              <Button
                variant="ghost"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleEditProduct}
                isLoading={isSubmitting}
              >
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
              {errorMessage && (
                <Alert
                  variant="error"
                  title={errorMessage}
                  onClose={() => setErrorMessage('')}
                  className="mb-4"
                />
              )}
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
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteProduct}
                isLoading={isSubmitting}
              >
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
                {(formError || errorMessage) && (
                  <Alert
                    variant="error"
                    title={formError || errorMessage}
                    onClose={() => {
                      setFormError('')
                      setErrorMessage('')
                    }}
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
                    if (errorMessage) setErrorMessage('')
                  }}
                  disabled={isSubmitting}
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
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                leftIcon={<ShoppingCart className="h-4 w-4" />}
                onClick={handleSellProduct}
                isLoading={isSubmitting}
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