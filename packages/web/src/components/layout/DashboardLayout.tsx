import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

/**
 * DashboardLayout Component
 *
 * Main layout wrapper for all dashboard pages.
 * Includes a responsive sidebar and top navbar.
 *
 * @example
 * // In router configuration:
 * {
 *   path: '/dashboard',
 *   element: <DashboardLayout />,
 *   children: [
 *     { index: true, element: <DashboardPage /> },
 *     { path: 'products', element: <ProductsPage /> },
 *   ]
 * }
 */
const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleOpenSidebar = () => {
    setSidebarOpen(true)
  }

  const handleCloseSidebar = () => {
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={handleCloseSidebar} />

      {/* Main Content Area */}
      {/* 
        min-w-0 is critical for flex children to allow horizontal overflow.
        By default, flex items have min-width: auto which prevents shrinking
        below content size. This breaks overflow-x scrolling in child elements.
      */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0 min-w-0">
        {/* Navbar */}
        <Navbar onMenuClick={handleOpenSidebar} />

        {/* Page Content */}
        {/* 
          min-w-0 also needed here since <main> is a flex item (flex-1) 
          in the column flex container above 
        */}
        <main className="flex-1 p-4 lg:p-6 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout