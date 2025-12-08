import React, { useState, useMemo } from 'react'
import PageHead from '@/components/common/PageHead'
import Table from '@/components/ui/Table'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Dialog from '@/components/ui/Dialog'
import Card from '@/components/ui/Card'
import Alert from '@/components/ui/Alert'
import EmptyState from '@/components/ui/EmptyState'
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Truck,
  User,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react'
import {
  validateForm,
  supplierSchema,
  type SupplierFormData as ZodSupplierFormData,
} from '@/utils/validation.util'

/**
 * Supplier interface defining the structure of a supplier
 */
interface Supplier {
  id: string
  name: string
  contactPerson: string
  email: string
  phone: string
  address: string
}

/**
 * Supplier form state interface
 */
interface SupplierFormState {
  name: string
  contactPerson: string
  email: string
  phone: string
  address: string
}

/**
 * Initial mock data for suppliers
 * Using supplier names from existing products for consistency
 */
const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: '1',
    name: 'TechCorp',
    contactPerson: 'John Smith',
    email: 'john.smith@techcorp.com',
    phone: '+1 (555) 123-4567',
    address: '123 Tech Avenue, Silicon Valley, CA 94025',
  },
  {
    id: '2',
    name: 'CableMax',
    contactPerson: 'Sarah Johnson',
    email: 'sarah.j@cablemax.com',
    phone: '+1 (555) 234-5678',
    address: '456 Cable Street, Austin, TX 78701',
  },
  {
    id: '3',
    name: 'OfficeGear',
    contactPerson: 'Michael Brown',
    email: 'mbrown@officegear.com',
    phone: '+1 (555) 345-6789',
    address: '789 Office Park, Seattle, WA 98101',
  },
  {
    id: '4',
    name: 'LightWorks',
    contactPerson: 'Emily Davis',
    email: 'emily.davis@lightworks.com',
    phone: '+1 (555) 456-7890',
    address: '321 Light Boulevard, Denver, CO 80202',
  },
  {
    id: '5',
    name: 'GamerZone',
    contactPerson: 'David Wilson',
    email: 'dwilson@gamerzone.com',
    phone: '+1 (555) 567-8901',
    address: '654 Gaming Way, Portland, OR 97201',
  },
  {
    id: '6',
    name: 'SoundMax',
    contactPerson: 'Lisa Anderson',
    email: 'l.anderson@soundmax.com',
    phone: '+1 (555) 678-9012',
    address: '987 Audio Lane, Nashville, TN 37201',
  },
  {
    id: '7',
    name: 'CleanTech',
    contactPerson: 'Robert Martinez',
    email: 'rmartinez@cleantech.com',
    phone: '+1 (555) 789-0123',
    address: '246 Clean Street, Phoenix, AZ 85001',
  },
]

/** Number of items per page for supplier list */
const ITEMS_PER_PAGE = 5

/** Initial empty supplier form */
const EMPTY_SUPPLIER_FORM: SupplierFormState = {
  name: '',
  contactPerson: '',
  email: '',
  phone: '',
  address: '',
}

/**
 * SupplierPage Component
 *
 * A dedicated page for managing suppliers featuring:
 * - Supplier List with Add/Edit/Delete functionality
 * - Search and pagination for suppliers
 * - Zod validation for all operations
 */
const SupplierPage: React.FC = () => {
  // Supplier states
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Supplier dialog states
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false)
  const [isEditSupplierOpen, setIsEditSupplierOpen] = useState(false)
  const [isDeleteSupplierOpen, setIsDeleteSupplierOpen] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null
  )
  const [supplierForm, setSupplierForm] =
    useState<SupplierFormState>(EMPTY_SUPPLIER_FORM)
  const [supplierFormError, setSupplierFormError] = useState('')

  // Filter suppliers based on search query
  const filteredSuppliers = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()
    if (!query) return suppliers
    return suppliers.filter(
      (supplier) =>
        supplier.name.toLowerCase().includes(query) ||
        supplier.contactPerson.toLowerCase().includes(query) ||
        supplier.email.toLowerCase().includes(query)
    )
  }, [suppliers, searchQuery])

  // Paginated suppliers
  const paginatedSuppliers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredSuppliers.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredSuppliers, currentPage])

  // Reset to first page when search changes
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  /**
   * Reset supplier form
   */
  const resetSupplierForm = () => {
    setSupplierForm(EMPTY_SUPPLIER_FORM)
    setSupplierFormError('')
  }

  /**
   * Validate supplier form using Zod
   * @returns Validated data or null if validation fails
   */
  const validateSupplierForm = (): ZodSupplierFormData | null => {
    const validation = validateForm(supplierSchema, {
      name: supplierForm.name.trim(),
      contactPerson: supplierForm.contactPerson.trim(),
      email: supplierForm.email.trim(),
      phone: supplierForm.phone.trim(),
      address: supplierForm.address.trim(),
    })

    if (!validation.success) {
      setSupplierFormError(validation.error || 'Validation failed')
      return null
    }

    setSupplierFormError('')
    return validation.data as ZodSupplierFormData
  }

  /**
   * Handle adding a new supplier
   */
  const handleAddSupplier = () => {
    const validatedData = validateSupplierForm()
    if (!validatedData) return

    const newSupplier: Supplier = {
      id: `supplier-${Date.now()}`,
      name: validatedData.name,
      contactPerson: validatedData.contactPerson,
      email: validatedData.email,
      phone: validatedData.phone,
      address: validatedData.address || '',
    }

    setSuppliers((prev) => [...prev, newSupplier])
    setIsAddSupplierOpen(false)
    resetSupplierForm()
  }

  /**
   * Open edit supplier dialog
   */
  const openEditSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setSupplierForm({
      name: supplier.name,
      contactPerson: supplier.contactPerson,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
    })
    setSupplierFormError('')
    setIsEditSupplierOpen(true)
  }

  /**
   * Handle editing a supplier
   */
  const handleEditSupplier = () => {
    if (!selectedSupplier) return

    const validatedData = validateSupplierForm()
    if (!validatedData) return

    setSuppliers((prev) =>
      prev.map((s) =>
        s.id === selectedSupplier.id
          ? {
              ...s,
              name: validatedData.name,
              contactPerson: validatedData.contactPerson,
              email: validatedData.email,
              phone: validatedData.phone,
              address: validatedData.address || '',
            }
          : s
      )
    )
    setIsEditSupplierOpen(false)
    setSelectedSupplier(null)
    resetSupplierForm()
  }

  /**
   * Open delete supplier dialog
   */
  const openDeleteSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setIsDeleteSupplierOpen(true)
  }

  /**
   * Handle deleting a supplier
   */
  const handleDeleteSupplier = () => {
    if (!selectedSupplier) return

    setSuppliers((prev) => prev.filter((s) => s.id !== selectedSupplier.id))
    setIsDeleteSupplierOpen(false)
    setSelectedSupplier(null)
  }

  /**
   * Handle supplier form field changes
   */
  const handleSupplierFormChange =
    (field: keyof SupplierFormState) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSupplierForm((prev) => ({ ...prev, [field]: e.target.value }))
      if (supplierFormError) setSupplierFormError('')
    }

  /**
   * Close add supplier dialog
   */
  const handleCloseAddSupplier = (open: boolean) => {
    setIsAddSupplierOpen(open)
    if (!open) resetSupplierForm()
  }

  /**
   * Close edit supplier dialog
   */
  const handleCloseEditSupplier = (open: boolean) => {
    setIsEditSupplierOpen(open)
    if (!open) {
      setSelectedSupplier(null)
      resetSupplierForm()
    }
  }

  /**
   * Close delete supplier dialog
   */
  const handleCloseDeleteSupplier = (open: boolean) => {
    setIsDeleteSupplierOpen(open)
    if (!open) setSelectedSupplier(null)
  }

  return (
    <>
      <PageHead
        title="Supplier Management"
        description="Manage your product suppliers and their contact information."
      />

      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-headline flex items-center gap-2">
              <Truck className="h-6 w-6" />
              Supplier Management
            </h1>
            <p className="mt-1 text-muted">
              Manage your product suppliers and their contact information.
            </p>
          </div>

          {/* Add Supplier Button */}
          <Dialog.Root
            open={isAddSupplierOpen}
            onOpenChange={handleCloseAddSupplier}
          >
            <Dialog.Trigger asChild>
              <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
                Add Supplier
              </Button>
            </Dialog.Trigger>

            <Dialog.Positioner>
              <Dialog.Backdrop />
              <Dialog.Content size="md">
                <Dialog.Header>
                  <Dialog.Title>Add New Supplier</Dialog.Title>
                  <Dialog.CloseTrigger />
                </Dialog.Header>

                <Dialog.Body>
                  <div className="space-y-4">
                    {supplierFormError && (
                      <Alert
                        variant="error"
                        title={supplierFormError}
                        onClose={() => setSupplierFormError('')}
                      />
                    )}

                    <Input
                      label="Supplier Name"
                      placeholder="Enter supplier name"
                      value={supplierForm.name}
                      onChange={handleSupplierFormChange('name')}
                      leftIcon={<Truck className="h-5 w-5" />}
                    />

                    <Input
                      label="Contact Person"
                      placeholder="Enter contact person name"
                      value={supplierForm.contactPerson}
                      onChange={handleSupplierFormChange('contactPerson')}
                      leftIcon={<User className="h-5 w-5" />}
                    />

                    <Input
                      label="Email"
                      type="email"
                      placeholder="Enter email address"
                      value={supplierForm.email}
                      onChange={handleSupplierFormChange('email')}
                      leftIcon={<Mail className="h-5 w-5" />}
                    />

                    <Input
                      label="Phone"
                      placeholder="Enter phone number"
                      value={supplierForm.phone}
                      onChange={handleSupplierFormChange('phone')}
                      leftIcon={<Phone className="h-5 w-5" />}
                    />

                    <Input
                      label="Address (Optional)"
                      placeholder="Enter address"
                      value={supplierForm.address}
                      onChange={handleSupplierFormChange('address')}
                      leftIcon={<MapPin className="h-5 w-5" />}
                    />
                  </div>
                </Dialog.Body>

                <Dialog.Footer>
                  <Button
                    variant="ghost"
                    onClick={() => setIsAddSupplierOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={handleAddSupplier}>
                    Add Supplier
                  </Button>
                </Dialog.Footer>
              </Dialog.Content>
            </Dialog.Positioner>
          </Dialog.Root>
        </div>

        {/* Search Bar */}
        <Card.Root padding="md">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by name, contact person, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="h-5 w-5" />}
              />
            </div>
            <div className="text-sm text-muted flex items-center">
              {filteredSuppliers.length}{' '}
              {filteredSuppliers.length === 1 ? 'supplier' : 'suppliers'}
              {searchQuery && ' (filtered)'}
            </div>
          </div>
        </Card.Root>

        {/* Supplier Table or EmptyState */}
        {filteredSuppliers.length === 0 ? (
          <EmptyState
            icon={Truck}
            title={searchQuery ? 'No suppliers found' : 'No suppliers yet'}
            description={
              searchQuery
                ? 'Try adjusting your search terms to find suppliers.'
                : 'Get started by adding your first supplier.'
            }
            action={
              searchQuery
                ? {
                    label: 'Clear Search',
                    onClick: () => setSearchQuery(''),
                    icon: <Search className="h-4 w-4" />,
                  }
                : {
                    label: 'Add Supplier',
                    onClick: () => setIsAddSupplierOpen(true),
                    icon: <Plus className="h-4 w-4" />,
                  }
            }
          />
        ) : (
          <>
            <Table.ScrollArea>
              <Table.Root variant="default" size="md" hoverable stickyHeader>
                <Table.Header>
                  <Table.Row disableHover>
                    <Table.Head>Supplier Name</Table.Head>
                    <Table.Head>Contact Person</Table.Head>
                    <Table.Head>Email</Table.Head>
                    <Table.Head>Phone</Table.Head>
                    <Table.Head align="center">Actions</Table.Head>
                  </Table.Row>
                </Table.Header>

                <Table.Body>
                  {paginatedSuppliers.map((supplier) => (
                    <Table.Row key={supplier.id}>
                      <Table.Cell>
                        <span className="font-medium text-headline whitespace-nowrap">
                          {supplier.name}
                        </span>
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap">
                        {supplier.contactPerson}
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap">
                        <a
                          href={`mailto:${supplier.email}`}
                          className="text-primary hover:underline"
                        >
                          {supplier.email}
                        </a>
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap">
                        {supplier.phone}
                      </Table.Cell>
                      <Table.Cell align="center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Pencil className="h-4 w-4" />}
                            onClick={() => openEditSupplier(supplier)}
                            aria-label={`Edit ${supplier.name}`}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Trash2 className="h-4 w-4" />}
                            onClick={() => openDeleteSupplier(supplier)}
                            className="text-error hover:text-error hover:bg-error/10"
                            aria-label={`Delete ${supplier.name}`}
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

            {/* Pagination */}
            <Table.Pagination
              currentPage={currentPage}
              totalItems={filteredSuppliers.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
              showInfo
              itemLabel="suppliers"
            />
          </>
        )}
      </div>

      {/* Edit Supplier Dialog */}
      <Dialog.Root
        open={isEditSupplierOpen}
        onOpenChange={handleCloseEditSupplier}
      >
        <Dialog.Positioner>
          <Dialog.Backdrop />
          <Dialog.Content size="md">
            <Dialog.Header>
              <Dialog.Title>Edit Supplier</Dialog.Title>
              <Dialog.CloseTrigger />
            </Dialog.Header>

            <Dialog.Body>
              <div className="space-y-4">
                {supplierFormError && (
                  <Alert
                    variant="error"
                    title={supplierFormError}
                    onClose={() => setSupplierFormError('')}
                  />
                )}

                <Input
                  label="Supplier Name"
                  placeholder="Enter supplier name"
                  value={supplierForm.name}
                  onChange={handleSupplierFormChange('name')}
                  leftIcon={<Truck className="h-5 w-5" />}
                />

                <Input
                  label="Contact Person"
                  placeholder="Enter contact person name"
                  value={supplierForm.contactPerson}
                  onChange={handleSupplierFormChange('contactPerson')}
                  leftIcon={<User className="h-5 w-5" />}
                />

                <Input
                  label="Email"
                  type="email"
                  placeholder="Enter email address"
                  value={supplierForm.email}
                  onChange={handleSupplierFormChange('email')}
                  leftIcon={<Mail className="h-5 w-5" />}
                />

                <Input
                  label="Phone"
                  placeholder="Enter phone number"
                  value={supplierForm.phone}
                  onChange={handleSupplierFormChange('phone')}
                  leftIcon={<Phone className="h-5 w-5" />}
                />

                <Input
                  label="Address (Optional)"
                  placeholder="Enter address"
                  value={supplierForm.address}
                  onChange={handleSupplierFormChange('address')}
                  leftIcon={<MapPin className="h-5 w-5" />}
                />
              </div>
            </Dialog.Body>

            <Dialog.Footer>
              <Button
                variant="ghost"
                onClick={() => setIsEditSupplierOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" onClick={handleEditSupplier}>
                Save Changes
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>

      {/* Delete Supplier Dialog */}
      <Dialog.Root
        open={isDeleteSupplierOpen}
        onOpenChange={handleCloseDeleteSupplier}
      >
        <Dialog.Positioner>
          <Dialog.Backdrop />
          <Dialog.Content size="sm">
            <Dialog.Header>
              <Dialog.Title>Delete Supplier</Dialog.Title>
              <Dialog.CloseTrigger />
            </Dialog.Header>

            <Dialog.Body>
              <p className="text-text">
                Are you sure you want to delete{' '}
                <span className="font-semibold text-headline">
                  {selectedSupplier?.name}
                </span>
                ? This action cannot be undone.
              </p>
            </Dialog.Body>

            <Dialog.Footer>
              <Button
                variant="ghost"
                onClick={() => setIsDeleteSupplierOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDeleteSupplier}>
                Delete Supplier
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </>
  )
}

export default SupplierPage