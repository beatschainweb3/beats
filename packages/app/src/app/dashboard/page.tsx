'use client'

import { useUnifiedAuth } from '@/context/UnifiedAuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import ProducerDashboardStats from '@/components/ProducerDashboardStats'
import BeatAnalytics from '@/components/BeatAnalytics'
import ProducerCollaboration from '@/components/ProducerCollaboration'
import MarketingTools from '@/components/MarketingTools'
import ProducerProfileSection from '@/components/ProducerProfileSection'
import EarningsOverview from '@/components/EarningsOverview'
import QuickActions from '@/components/QuickActions'
import BeatManagementTable from '@/components/BeatManagementTable'
import DashboardLayout from '@/components/DashboardLayout'
import EnhancedBeatManagement from '@/components/EnhancedBeatManagement'
import TransactionHistory from '@/components/TransactionHistory'

interface ProducerStats {
  totalEarnings: number
  totalSales: number
  totalPlays: number
  monthlyEarnings: number
}

function DashboardContent() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">🎤 Producer Dashboard</h1>
      
      {/* Quick Actions */}
      <div className="mb-8">
        <QuickActions />
      </div>
      
      {/* Earnings Overview */}
      <div className="mb-8">
        <EarningsOverview />
      </div>
      
      {/* Producer Profile Section */}
      <div id="profile-section" className="mb-8">
        <ProducerProfileSection />
      </div>
      
      {/* Beat Management Section */}
      <div className="mb-8">
        <EnhancedBeatManagement />
      </div>
      
      {/* Legacy Stats (keeping for compatibility) */}
      <div className="mb-8">
        <ProducerDashboardStats />
      </div>
      
      {/* Transaction History Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Transaction History</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <TransactionHistory />
        </div>
      </div>
      
      {/* Beat Analytics Section */}
      <div className="mt-8">
        <BeatAnalytics />
      </div>
      
      {/* Producer Collaboration Section */}
      <div className="mt-8">
        <ProducerCollaboration />
      </div>
      
      {/* Marketing Tools Section */}
      <div className="mt-8">
        <MarketingTools />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute 
      anyRole={['producer', 'admin', 'super_admin']} 
      requireWallet={true}
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-700 text-white flex items-center justify-center p-4">
          <div className="max-w-md text-center bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20">
            <div className="text-5xl mb-4">🎤</div>
            <h1 className="text-3xl font-bold mb-4">Producer Dashboard</h1>
            <p className="mb-6 opacity-90">
              Manage your beats, track earnings, and grow your music business with Web3 technology
            </p>
            <div className="bg-white/10 p-4 rounded-lg mb-6 text-left">
              <h3 className="font-semibold mb-2">How to become a producer:</h3>
              <p>1. Connect your wallet</p>
              <p>2. Go to Profile settings</p>
              <p>3. Change role to "Producer"</p>
            </div>
            <div className="flex gap-4 justify-center">
              <a href="/profile" className="bg-yellow-500 text-gray-900 px-4 py-2 rounded-md font-medium">
                Update Profile
              </a>
              <a href="/beatnfts" className="bg-white/20 border border-white/30 px-4 py-2 rounded-md font-medium">
                Browse BeatNFTs
              </a>
            </div>
          </div>
        </div>
      }
    >
      <DashboardLayout>
        <DashboardContent />
      </DashboardLayout>
    </ProtectedRoute>
  )
}