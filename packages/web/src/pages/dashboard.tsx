import React from 'react'
import PageHead from '@/components/common/PageHead'

const DashboardPage: React.FC = () => {
  return (
    <>
      <PageHead
        title="Dashboard"
        description="Overview of your inventory and business metrics."
      />

      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-headline">Dashboard</h1>
          <p className="mt-1 text-muted">
            Welcome back! Here's an overview of your inventory.
          </p>
        </div>
      </div>
    </>
  )
}

export default DashboardPage
