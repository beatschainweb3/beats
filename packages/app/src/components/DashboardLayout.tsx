'use client'

import { ReactNode } from 'react'
import DashboardSidebar from './DashboardSidebar'
import { useUnifiedAuth } from '@/context/UnifiedAuthContext'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isAuthenticated } = useUnifiedAuth()
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-medium text-gray-900 mb-4">Please connect your wallet</h2>
          <p className="text-gray-600 mb-6">You need to connect your wallet to access the dashboard</p>
          <w3m-button label="Connect Wallet" balance="hide" />
        </div>
      </div>
    )
  }
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />
      <div className="flex-1 p-6">
        {children}
      </div>
    </div>
  )
}