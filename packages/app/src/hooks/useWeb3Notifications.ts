'use client'

import { useState, useEffect } from 'react'

interface NotificationEvent {
  id: string
  type: 'purchase' | 'sale' | 'mint' | 'transfer'
  title: string
  message: string
  timestamp: Date
  txHash: string
  amount?: string
  beatId?: string
  from?: string
  to?: string
  read?: boolean
}

export function useWeb3Notifications() {
  const [notifications, setNotifications] = useState<NotificationEvent[]>([])
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addNotification = (notification: NotificationEvent) => {
    setNotifications(prev => [notification, ...prev.slice(0, 49)])
    
    try {
      const stored = localStorage.getItem('web3-notifications')
      const existing = stored ? JSON.parse(stored) : []
      const updated = [notification, ...existing.slice(0, 49)]
      localStorage.setItem('web3-notifications', JSON.stringify(updated))
    } catch (e) {
      console.warn('Failed to store notifications:', e)
    }
  }

  const clearNotifications = () => {
    setNotifications([])
    try {
      localStorage.removeItem('web3-notifications')
    } catch (e) {
      console.warn('Failed to clear notifications:', e)
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  useEffect(() => {
    try {
      const stored = localStorage.getItem('web3-notifications')
      if (stored) {
        const parsed = JSON.parse(stored)
        setNotifications(parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        })))
      }
    } catch (error) {
      console.warn('Failed to parse stored notifications:', error)
    }
    
    // Add demo notification
    if (notifications.length === 0) {
      const demoNotification: NotificationEvent = {
        id: 'demo-1',
        type: 'purchase',
        title: '🎵 Demo Notification',
        message: 'Real notifications will appear here when Web3 is connected',
        timestamp: new Date(),
        txHash: '0x123...',
        read: false
      }
      setNotifications([demoNotification])
    }
    
    setIsListening(false)
    setError('Web3 notifications disabled - using demo mode')
  }, [])

  return {
    notifications,
    isListening,
    error,
    clearNotifications,
    markAsRead,
    addNotification
  }
}