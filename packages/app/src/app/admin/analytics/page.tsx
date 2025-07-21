'use client'

import { useState, useEffect } from 'react'
import { useUnifiedAuth } from '@/context/UnifiedAuthContext'
import { useAdminAnalytics } from '@/hooks/useAdminAnalytics'
import { LinkComponent } from '@/components/LinkComponent'
import ProtectedRoute from '@/components/ProtectedRoute'

function AdminAnalyticsContent() {
  const { user } = useUnifiedAuth()
  const { analytics, loading } = useAdminAnalytics()
  const stats = {
    overview: {
      totalUsers: analytics.platformStats.totalUsers,
      totalBeats: analytics.platformStats.totalBeats,
      totalRevenue: parseFloat(analytics.platformStats.totalRevenue)
    },
    beats: { byGenre: {} }
  }



  return (
    <div>
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">📊 Platform Analytics</h1>
          <LinkComponent href="/admin" className="text-white/80 hover:text-white">← Back to Admin</LinkComponent>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold mb-4">Revenue Overview</h3>
              <div className="text-3xl font-bold text-green-600">R{stats?.overview?.totalRevenue?.toLocaleString() || '0'}</div>
              <p className="text-sm text-gray-600">Total Revenue</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold mb-4">User Growth</h3>
              <div className="text-3xl font-bold text-blue-600">{stats?.overview?.totalUsers || '0'}</div>
              <p className="text-sm text-gray-600">Total Users</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold mb-4">Content Stats</h3>
              <div className="text-3xl font-bold text-purple-600">{stats?.overview?.totalBeats || '0'}</div>
              <p className="text-sm text-gray-600">Total Beats</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow md:col-span-2 lg:col-span-3">
              <h3 className="font-semibold mb-4">Popular Genres</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(stats?.beats?.byGenre || {}).map(([genre, count]) => (
                  <div key={genre} className="text-center">
                    <div className="text-2xl font-bold text-gray-800">{count as number}</div>
                    <div className="text-sm text-gray-600 capitalize">{genre}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminAnalyticsPage() {
  return (
    <ProtectedRoute anyRole={['admin', 'super_admin']} requireWallet={true}>
      <AdminAnalyticsContent />
    </ProtectedRoute>
  )
}