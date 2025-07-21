'use client'

import { useState, useEffect } from 'react'

interface PWAState {
  isInstallable: boolean
  isInstalled: boolean
  isOnline: boolean
  showInstallPrompt: boolean
}

export function usePWA() {
  const [state, setState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isOnline: true,
    showInstallPrompt: false
  })
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    // Check if already installed
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                       (window.navigator as any).standalone === true

    // Check online status
    const isOnline = navigator.onLine

    setState(prev => ({ ...prev, isInstalled, isOnline }))

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setState(prev => ({ ...prev, isInstallable: true }))
      
      // Show install prompt after user interaction
      setTimeout(() => {
        setState(prev => ({ ...prev, showInstallPrompt: true }))
      }, 5000)
    }

    // Listen for app installed
    const handleAppInstalled = () => {
      setState(prev => ({ ...prev, isInstalled: true, isInstallable: false, showInstallPrompt: false }))
      setDeferredPrompt(null)
    }

    // Listen for online/offline
    const handleOnline = () => setState(prev => ({ ...prev, isOnline: true }))
    const handleOffline = () => setState(prev => ({ ...prev, isOnline: false }))

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const installApp = async () => {
    if (!deferredPrompt) return false

    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        setState(prev => ({ ...prev, showInstallPrompt: false }))
        return true
      }
      return false
    } catch (error) {
      console.error('Install failed:', error)
      return false
    }
  }

  const dismissInstallPrompt = () => {
    setState(prev => ({ ...prev, showInstallPrompt: false }))
    localStorage.setItem('pwa_install_dismissed', Date.now().toString())
  }

  return {
    ...state,
    installApp,
    dismissInstallPrompt
  }
}