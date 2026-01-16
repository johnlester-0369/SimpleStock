import React, { useState, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  ShoppingCart,
  AlertTriangle,
  Truck,
} from 'lucide-react'
import PageHead from '@/components/common/PageHead'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Table from '@/components/ui/Table'
import Dropdown from '@/components/ui/Dropdown'
import Dialog from '@/components/ui/Dialog'
import EmptyState from '@/components/ui/EmptyState'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Alert from '@/components/ui/Alert'
import Pagination from '@/components/ui/Pagination'
import { cn } from '@/utils/cn.util'
import { ROUTE_SETTINGS_SUPPLIER } from '@/constants/routes.constants'

// Import hooks
import { useProducts } from '@/hooks/useProducts'
import { useSuppliers } from '@/hooks/useSuppliers'
import { useProductMutations } from '@/hooks/useProductMutations'
import type { Product } from '@/services/product.service'

// ============================================================================
// CONSTANTS
// ============================================================================

const ITEMS_PER_PAGE = 10
const LOW_STOCK_THRESHOLD = 5

/** Stock status filter options */
const STOCK_FILTER_OPTIONS = [
  { value: 'all', label: 'All Products' },
  { value: 'in-stock', label: 'In Stock' },
  { value: 'low-stock', label: 'Low Stock' },
  { value: 'out-of-stock', label: 'Out of Stock' },
]

// ============================================================================
// TYPES
// ============================================================================

type StockFilterValue = 'all' | 'in-stock' | 'low-stock' | 'out-of-stock'

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

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
 * Get stock status badge variant and text
 */
const getStockStatus = (
  quantity: number,
): { variant: 'success' | 'warning' | 'error'; text: string } => {
  if (quantity === 0) {
    return { variant: 'error', text: 'Out of Stock' }
  }
  if (quantity < LOW_STOCK_THRESHOLD) {
    return { variant: 'warning', text: 'Low Stock' }
  }
  return { variant: 'success', text: 'In Stock' }
}

/**
 * Validate stock filter value from URL params
 */
const isValidStockFilter = (value: string | null): value is StockFilterValue => {
  return (
    value === 'all' ||
    value === 'in-stock' ||
    value === 'low-stock' ||
    value === 'out-of-stock'
  )
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * ProductsPage Component
 *
 * Products inventory management page featuring:
 * - Product listing with search and filters
 * - CRUD operations (Create, Read, Update, Delete)
 * - Sell product functionality
 * - Pagination
 * - Stock status indicators
 * - Supplier dropdown (fetched from Supplier settings)
 * - Empty state when no suppliers exist (redirects to supplier settings)
 */
const ProductsPage: React.FC = () => {
  // URL search params for filter persistence
  const [searchParams, setSearchParams] = useSearchParams()
  
  // Navigation hook for redirecting to supplier settings
  const navigate = useNavigate()

  // ============================================================================
  // STATE
  // ============================================================================

  // Initialize stock filter from URL params
  const urlFilterParam = searchParams.get('filter')
  const initialStockFilter: StockFilterValue = isValidStockFilter(urlFilterParam)
    ? urlFilterParam
    : 'all'

  const [searchQuery, setSearchQuery] = useState('')
  const [stockFilter, setStockFilter] = useState<StockFilterValue>(initialStockFilter)
  const [supplierFilter, setSupplierFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSellDialogOpen, setIsSellDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  // Form states - now uses supplierId instead of supplier name
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stockQuantity: '',
    supplierId: '',
  })
  const [sellQuantity, setSellQuantity] = useState('1')
  const [formError, setFormError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // ============================================================================
  // HOOKS
  // ============================================================================

  // Fetch suppliers for dropdown (from supplier settings)
  const { suppliers: suppliersList, loading: suppliersLoading } = useSuppliers()

  // Fetch products with filters - now uses supplierId
  const {
    products,
    stats,
    loading,
    error: fetchError,
    refetch,
  } = useProducts({
    search: searchQuery,
    stockStatus: stockFilter,
    supplierId: supplierFilter,
  })

  // Product mutations
  const { isSubmitting, createProduct, updateProduct, sellProduct, deleteProduct } =
    useProductMutations({
      onSuccess: (message) => {
        setSuccessMessage(message)
        refetch()
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000)
      },
      onError: (message) => {
        setFormError(message)
      },
    })

  // ============================================================================
  // DERIVED STATE
  // ============================================================================

  // Supplier dropdown options - uses supplier ID as value
  const supplierOptions = useMemo(
    () => [
      { value: '', label: 'All Suppliers' },
      ...suppliersList.map((s) => ({ value: s.id, label: s.name })),
    ],
    [suppliersList],
  )

  // Supplier dropdown options for create/edit forms (without "All Suppliers")
  const supplierFormOptions = useMemo(
    () => suppliersList.map((s) => ({ value: s.id, label: s.name })),
    [suppliersList],
  )

  // Pagination
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE)
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return products.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [products, currentPage])

  // ============================================================================
  // HANDLERS
  // ============================================================================

  /**
   * Handle navigation to supplier settings page
   */
  const handleNavigateToSupplierSettings = () => {
    navigate(ROUTE_SETTINGS_SUPPLIER)
  }

  /**
   * Handle search input change
   * Resets pagination to page 1 when search query changes
   */
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  /**
   * Handle stock filter change
   * Resets pagination to page 1 when filter changes
   */
  const handleStockFilterChange = (value: string) => {
    const filterValue = value as StockFilterValue
    setStockFilter(filterValue)
    setCurrentPage(1)
    // Update URL params
    if (filterValue === 'all') {
      searchParams.delete('filter')
    } else {
      searchParams.set('filter', filterValue)
    }
    setSearchParams(searchParams)
  }

  /**
   * Handle supplier filter change - now uses supplierId
   * Resets pagination to page 1 when filter changes
   */
  const handleSupplierFilterChange = (value: string) => {
    setSupplierFilter(value)
    setCurrentPage(1)
  }

  /**
   * Open create dialog
   */
  const handleOpenCreate = () => {
    setFormData({ name: '', price: '', stockQuantity: '', supplierId: '' })
    setFormError('')
    setIsCreateDialogOpen(true)
  }

  /**
   * Open edit dialog - now uses supplierId
   */
  const handleOpenEdit = (product: Product) => {
    setSelectedProduct(product)
    setFormData({
      name: product.name,
      price: String(product.price),
      stockQuantity: String(product.stockQuantity),
      supplierId: product.supplierId,
    })
    setFormError('')
    setIsEditDialogOpen(true)
  }

  /**
   * Open sell dialog
   */
  const handleOpenSell = (product: Product) => {
    setSelectedProduct(product)
    setSellQuantity('1')
    setFormError('')
    setIsSellDialogOpen(true)
  }

  /**
   * Open delete dialog
   */
  const handleOpenDelete = (product: Product) => {
    setSelectedProduct(product)
    setIsDeleteDialogOpen(true)
  }

  /**
   * Handle create product - now sends supplierId
   */
  const handleCreate = async () => {
    setFormError('')
    const result = await createProduct({
      name: formData.name,
      price: parseFloat(formData.price),
      stockQuantity: parseInt(formData.stockQuantity, 10),
      supplierId: formData.supplierId,
    })
    if (result) {
      setIsCreateDialogOpen(false)
    }
  }

  /**
   * Handle update product - now sends supplierId
   */
  const handleUpdate = async () => {
    if (!selectedProduct) return
    setFormError('')
    const result = await updateProduct(selectedProduct.id, {
      name: formData.name,
      price: parseFloat(formData.price),
      stockQuantity: parseInt(formData.stockQuantity, 10),
      supplierId: formData.supplierId,
    })
    if (result) {
      setIsEditDialogOpen(false)
    }
  }

  /**
   * Handle sell product
   */
  const handleSell = async () => {
    if (!selectedProduct) return
    setFormError('')
    const quantity = parseInt(sellQuantity, 10)
    const result = await sellProduct(
      selectedProduct.id,
      quantity,
      selectedProduct.stockQuantity,
    )
    if (result) {
      setIsSellDialogOpen(false)
    }
  }

  /**
   * Handle delete product
   */
  const handleDelete = async () => {
    if (!selectedProduct) return
    const success = await deleteProduct(selectedProduct.id)
    if (success) {
      setIsDeleteDialogOpen(false)
    }
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  // Show loading state during initial load
  if ((loading && products.length === 0) || suppliersLoading) {
    return <LoadingSpinner />
  }

  // Show empty state if no suppliers exist - user must add suppliers first
  if (!suppliersLoading && suppliersList.length === 0) {
    return (
      <>
        <PageHead
          title="Products"
          description="Manage your product inventory, track stock levels, and handle sales."
        />
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <EmptyState
            icon={Truck}
            title="No Suppliers Available"
            description="You need to add at least one supplier before you can manage products. Go to Supplier Settings to add your first supplier."
            action={{
              label: 'Go to Supplier Settings',
              onClick: handleNavigateToSupplierSettings,
              icon: <Plus className="h-4 w-4" />,
            }}
          />
        </div>
      </>
    )
  }

  // Determine if we should show the "Add Product" action in empty state
  const showAddProductAction = !searchQuery && stockFilter === 'all' && !supplierFilter

  return (
    <>
      <PageHead
        title="Products"
        description="Manage your product inventory, track stock levels, and handle sales."
      />

      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-headline">Products</h1>
            <p className="mt-1 text-muted">
              Manage your product inventory and track stock levels.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={handleOpenCreate}
            leftIcon={<Plus className="h-4 w-4" />}
            className="sm:w-auto w-full"
          >
            Add Product
          </Button>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <Alert
            variant="success"
            title={successMessage}
            onClose={() => setSuccessMessage('')}
          />
        )}
        {fetchError && (
          <Alert
            variant="error"
            title={fetchError}
            onClose={() => refetch()}
          />
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card.Root padding="md">
            <Card.Body>
              <p className="text-sm text-muted">Total Products</p>
              <p className="text-2xl font-bold text-headline">
                {stats.totalProducts}
              </p>
            </Card.Body>
          </Card.Root>
          <Card.Root padding="md">
            <Card.Body>
              <p className="text-sm text-muted">Total Units</p>
              <p className="text-2xl font-bold text-headline">
                {stats.totalUnits}
              </p>
            </Card.Body>
          </Card.Root>
          <Card.Root padding="md">
            <Card.Body>
              <p className="text-sm text-muted">Inventory Value</p>
              <p className="text-2xl font-bold text-headline">
                {formatPrice(stats.totalValue)}
              </p>
            </Card.Body>
          </Card.Root>
          <Card.Root padding="md">
            <Card.Body>
              <p className="text-sm text-muted">Low Stock Items</p>
              <p className="text-2xl font-bold text-warning">
                {stats.lowStockCount}
              </p>
            </Card.Body>
          </Card.Root>
        </div>

        {/* Filters */}
        <Card.Root padding="md">
          <Card.Body>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  leftIcon={<Search className="h-4 w-4" />}
                />
              </div>
              <div className="flex gap-4">
                <Dropdown
                  options={STOCK_FILTER_OPTIONS}
                  value={stockFilter}
                  onChange={handleStockFilterChange}
                  placeholder="Filter by stock"
                  size="md"
                />
                <Dropdown
                  options={supplierOptions}
                  value={supplierFilter}
                  onChange={handleSupplierFilterChange}
                  placeholder="Filter by supplier"
                  size="md"
                />
              </div>
            </div>
          </Card.Body>
        </Card.Root>

        {/* Products Table */}
        <Card.Root padding="md">
          <Card.Body className="p-0">
            {paginatedProducts.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  icon={Package}
                  title="No products found"
                  description={
                    searchQuery || stockFilter !== 'all' || supplierFilter
                      ? 'Try adjusting your filters.'
                      : 'Get started by adding your first product.'
                  }
                  action={
                    showAddProductAction
                      ? {
                          label: 'Add Product',
                          onClick: handleOpenCreate,
                          icon: <Plus className="h-4 w-4" />,
                        }
                      : undefined
                  }
                />
              </div>
            ) : (
              <>
                <Table.ScrollArea>
                  <Table.Root variant="default" size="md" hoverable stickyHeader>
                    <Table.Header>
                      <Table.Row disableHover>
                        <Table.Head>Product</Table.Head>
                        <Table.Head>Supplier</Table.Head>
                        <Table.Head align="right">Price</Table.Head>
                        <Table.Head align="center">Stock</Table.Head>
                        <Table.Head align="center">Status</Table.Head>
                        <Table.Head align="right">Actions</Table.Head>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {paginatedProducts.map((product) => {
                        const stockStatus = getStockStatus(product.stockQuantity)
                        return (
                          <Table.Row key={product.id}>
                            <Table.Cell>
                              <span className="font-medium text-headline">
                                {product.name}
                              </span>
                            </Table.Cell>
                            <Table.Cell>
                              <span className="text-text">{product.supplierName}</span>
                            </Table.Cell>
                            <Table.Cell align="right">
                              <span className="font-medium">
                                {formatPrice(product.price)}
                              </span>
                            </Table.Cell>
                            <Table.Cell align="center">
                              <span
                                className={cn(
                                  'font-medium',
                                  product.stockQuantity === 0 && 'text-error',
                                  product.stockQuantity > 0 &&
                                    product.stockQuantity < LOW_STOCK_THRESHOLD &&
                                    'text-warning',
                                )}
                              >
                                {product.stockQuantity}
                              </span>
                            </Table.Cell>
                            <Table.Cell align="center">
                              <span
                                className={cn(
                                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                                  stockStatus.variant === 'success' &&
                                    'bg-success/10 text-success',
                                  stockStatus.variant === 'warning' &&
                                    'bg-warning/10 text-warning',
                                  stockStatus.variant === 'error' &&
                                    'bg-error/10 text-error',
                                )}
                              >
                                {stockStatus.text}
                              </span>
                            </Table.Cell>
                            <Table.Cell align="right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenSell(product)}
                                  disabled={product.stockQuantity === 0}
                                  title="Sell"
                                >
                                  <ShoppingCart className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenEdit(product)}
                                  title="Edit"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenDelete(product)}
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4 text-error" />
                                </Button>
                              </div>
                            </Table.Cell>
                          </Table.Row>
                        )
                      })}
                    </Table.Body>
                  </Table.Root>
                </Table.ScrollArea>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="p-4 border-t border-border">
                    <Pagination
                      currentPage={currentPage}
                      totalItems={products.length}
                      itemsPerPage={ITEMS_PER_PAGE}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </>
            )}
          </Card.Body>
        </Card.Root>

        {/* Create Product Dialog */}
        <Dialog.Root
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
        >
          <Dialog.Positioner>
            <Dialog.Backdrop />
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Add New Product</Dialog.Title>
                <Dialog.CloseTrigger />
              </Dialog.Header>
              <Dialog.Body>
                <div className="space-y-4">
                  {formError && <Alert variant="error" title={formError} />}
                  <Input
                    label="Product Name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Enter product name"
                  />
                  <Input
                    label="Price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, price: e.target.value }))
                    }
                    placeholder="0.00"
                  />
                  <Input
                    label="Stock Quantity"
                    type="number"
                    min="0"
                    value={formData.stockQuantity}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, stockQuantity: e.target.value }))
                    }
                    placeholder="0"
                  />
                  {/* Supplier Dropdown instead of Input */}
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">
                      Supplier
                    </label>
                    <Dropdown
                      options={supplierFormOptions}
                      value={formData.supplierId}
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, supplierId: value }))
                      }
                      placeholder="Select a supplier"
                      size="md"
                    />
                    {supplierFormOptions.length === 0 && (
                      <p className="mt-1 text-sm text-warning">
                        No suppliers available. Please add suppliers first in Settings.
                      </p>
                    )}
                  </div>
                </div>
              </Dialog.Body>
              <Dialog.Footer>
                <Button
                  variant="secondary"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={isSubmitting || !formData.supplierId}
                >
                  {isSubmitting ? 'Creating...' : 'Create Product'}
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>

        {/* Edit Product Dialog */}
        <Dialog.Root
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        >
          <Dialog.Positioner>
            <Dialog.Backdrop />
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Edit Product</Dialog.Title>
                <Dialog.CloseTrigger />
              </Dialog.Header>
              <Dialog.Body>
                <div className="space-y-4">
                  {formError && <Alert variant="error" title={formError} />}
                  <Input
                    label="Product Name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Enter product name"
                  />
                  <Input
                    label="Price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, price: e.target.value }))
                    }
                    placeholder="0.00"
                  />
                  <Input
                    label="Stock Quantity"
                    type="number"
                    min="0"
                    value={formData.stockQuantity}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, stockQuantity: e.target.value }))
                    }
                    placeholder="0"
                  />
                  {/* Supplier Dropdown instead of Input */}
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">
                      Supplier
                    </label>
                    <Dropdown
                      options={supplierFormOptions}
                      value={formData.supplierId}
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, supplierId: value }))
                      }
                      placeholder="Select a supplier"
                      size="md"
                    />
                  </div>
                </div>
              </Dialog.Body>
              <Dialog.Footer>
                <Button
                  variant="secondary"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdate}
                  disabled={isSubmitting || !formData.supplierId}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>

        {/* Sell Product Dialog */}
        <Dialog.Root
          open={isSellDialogOpen}
          onOpenChange={setIsSellDialogOpen}
        >
          <Dialog.Positioner>
            <Dialog.Backdrop />
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Sell Product</Dialog.Title>
                <Dialog.CloseTrigger />
              </Dialog.Header>
              <Dialog.Body>
                <div className="space-y-4">
                  {formError && <Alert variant="error" title={formError} />}
                  {selectedProduct && (
                    <>
                      <div className="p-4 bg-surface-1 rounded-lg">
                        <p className="font-medium text-headline">{selectedProduct.name}</p>
                        <p className="text-sm text-muted">
                          Supplier: {selectedProduct.supplierName}
                        </p>
                        <p className="text-sm text-muted">
                          Available: {selectedProduct.stockQuantity} units
                        </p>
                        <p className="text-sm text-muted">
                          Price: {formatPrice(selectedProduct.price)} per unit
                        </p>
                      </div>
                      <Input
                        label="Quantity to Sell"
                        type="number"
                        min="1"
                        max={selectedProduct.stockQuantity}
                        value={sellQuantity}
                        onChange={(e) => setSellQuantity(e.target.value)}
                      />
                      <div className="p-4 bg-primary/5 rounded-lg">
                        <p className="text-sm text-muted">Total Amount</p>
                        <p className="text-xl font-bold text-primary">
                          {formatPrice(
                            selectedProduct.price * parseInt(sellQuantity || '0', 10),
                          )}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </Dialog.Body>
              <Dialog.Footer>
                <Button
                  variant="secondary"
                  onClick={() => setIsSellDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSell} disabled={isSubmitting}>
                  {isSubmitting ? 'Processing...' : 'Complete Sale'}
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>

        {/* Delete Confirmation Dialog */}
        <Dialog.Root
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <Dialog.Positioner>
            <Dialog.Backdrop />
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Delete Product</Dialog.Title>
                <Dialog.CloseTrigger />
              </Dialog.Header>
              <Dialog.Body>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-error/10 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="h-5 w-5 text-error" />
                    </div>
                    <div>
                      <p className="text-text">
                        Are you sure you want to delete{' '}
                        <span className="font-medium text-headline">
                          {selectedProduct?.name}
                        </span>
                        ? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </Dialog.Body>
              <Dialog.Footer>
                <Button
                  variant="secondary"
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Deleting...' : 'Delete'}
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>
      </div>
    </>
  )
}

export default ProductsPage