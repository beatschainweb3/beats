'use client'

import { useState, useEffect } from 'react'
import { useUnifiedAuth } from '@/context/UnifiedAuthContext'
import { useWeb3Events } from '@/hooks/useWeb3Events'
import { useAccount, useWatchContractEvent } from 'wagmi'
import { BeatNFTConfig } from '@/contracts/BeatNFT'
import { toast } from 'react-toastify'

interface Notification {
  id: string
  type: 'sale' | 'purchase' | 'upload' | 'system'
  title: string
  message: string
  read: boolean
  createdAt: Date
}

export default function NotificationCenter() {
  const { user } = useUnifiedAuth()
  const { address } = useAccount()
  const { events } = useWeb3Events(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Real-time event listeners for immediate notifications
  useWatchContractEvent({
    address: BeatNFTConfig.address[11155111] as `0x${string}`,
    abi: BeatNFTConfig.abi,
    eventName: 'BeatMinted',
    onLogs: (logs) => {
      logs.forEach(log => {
        if (log.args.producer === address) {
          const notification: Notification = {
            id: `mint-${log.transactionHash}-${Date.now()}`,
            type: 'upload',
            title: '🎵 Beat Minted!',
            message: `Your beat #${log.args.tokenId} was successfully minted as NFT`,
            read: false,
            createdAt: new Date()
          }
          addNotification(notification)
          toast.success(notification.message)
        }
      })
    },
    enabled: !!address
  })

  useWatchContractEvent({
    address: BeatNFTConfig.address[11155111] as `0x${string}`,
    abi: BeatNFTConfig.abi,
    eventName: 'BeatSold',
    onLogs: (logs) => {
      logs.forEach(log => {
        if (log.args.buyer === address) {
          const notification: Notification = {
            id: `purchase-${log.transactionHash}-${Date.now()}`,
            type: 'purchase',
            title: '🛍️ Beat Purchased!',
            message: `You bought beat #${log.args.tokenId} for ${(Number(log.args.price) / 1e18).toFixed(3)} ETH`,
            read: false,
            createdAt: new Date()
          }
          addNotification(notification)
          toast.success(notification.message)
        }
        // Check if user is the seller (need to get current owner from contract)
        // For now, we'll check if it's a beat they previously owned
      })
    },
    enabled: !!address
  })

  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 19)]) // Keep latest 20
    setUnreadCount(prev => prev + 1)
    
    // Store in localStorage
    try {
      const stored = JSON.parse(localStorage.getItem('notifications') || '[]')
      const updated = [notification, ...stored.slice(0, 49)] // Keep latest 50
      localStorage.setItem('notifications', JSON.stringify(updated))
    } catch (error) {
      console.warn('Failed to store notification:', error)
    }
  }

  useEffect(() => {
    if (!user || !address) return

    // Load stored notifications
    try {
      const stored = localStorage.getItem('notifications')
      if (stored) {
        const parsedNotifications = JSON.parse(stored).map((n: any) => ({
          ...n,
          createdAt: new Date(n.createdAt)
        }))
        setNotifications(parsedNotifications)
        setUnreadCount(parsedNotifications.filter((n: Notification) => !n.read).length)
      }
    } catch (error) {
      console.warn('Failed to load stored notifications:', error)
    }

    // Convert existing Web3 events to notifications (for historical data)
    const web3Notifications: Notification[] = events
      .filter(event => {
        // Show events related to current user
        return event.data?.producer === address || 
               event.data?.buyer === address ||
               event.data?.to === address
      })
      .slice(0, 10) // Latest 10 notifications
      .map(event => {
        let title = 'Blockchain Event'
        let message = 'Transaction completed'
        let type: Notification['type'] = 'system'

        if (event.type === 'mint') {
          title = '🎵 Beat Minted!'
          message = `Your beat #${event.tokenId} was minted as NFT`
          type = 'upload'
        } else if (event.type === 'purchase') {
          if (event.data?.buyer === address) {
            title = '🛍️ Beat Purchased!'
            message = `You bought beat #${event.tokenId}`
            type = 'purchase'
          } else {
            title = '💰 Beat Sold!'
            message = `Your beat #${event.tokenId} was sold for ${event.data?.price || '0'} ETH`
            type = 'sale'
          }
        }

        return {
          id: event.id,
          type,
          title,
          message,
          read: false,
          createdAt: event.timestamp
        }
      })
      
    // Merge with stored notifications (avoid duplicates)
    setNotifications(prev => {
      const existingIds = new Set(prev.map(n => n.id))
      const newNotifications = web3Notifications.filter(n => !existingIds.has(n.id))
      return [...newNotifications, ...prev].slice(0, 20)
    })
  }, [user, address, events])

  const markAsRead = (id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n)
      // Update localStorage
      try {
        localStorage.setItem('notifications', JSON.stringify(updated))
      } catch (error) {
        console.warn('Failed to update stored notifications:', error)
      }
      return updated
    })
    setUnreadCount(prev => Math.max(0, prev - 1))
  }
  
  const markAllAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }))
      // Update localStorage
      try {
        localStorage.setItem('notifications', JSON.stringify(updated))
      } catch (error) {
        console.warn('Failed to update stored notifications:', error)
      }
      return updated
    })
    setUnreadCount(0)
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'sale': return '💰'
      case 'purchase': return '🛒'
      case 'upload': return '📤'
      default: return '🔔'
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
      >
        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM12 2a7 7 0 00-7 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 001 1h16a1 1 0 001-1v-2.26C18.19 13.47 17 11.38 17 9a7 7 0 00-7-7zM9 21h6" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Notifications</h3>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications yet
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl">{getIcon(notification.type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">{notification.title}</h4>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-2">{formatTime(notification.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {notifications.length > 0 && (
            <div className="p-3 border-t">
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}