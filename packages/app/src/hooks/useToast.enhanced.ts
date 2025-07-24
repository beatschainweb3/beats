'use client'

import { useCallback, useRef } from 'react'
import { enhancedToastManager } from '@/utils/toastManager.enhanced'
import { performanceMonitor } from '@/utils/performanceMonitor'
import { ToastOptions } from 'react-toastify'

interface EnhancedToastOptions extends ToastOptions {
  throttleKey?: string
  throttleMs?: number
  once?: boolean // Show only once per component instance
}

export function useEnhancedToast() {
  const shownOnce = useRef(new Set<string>())
  
  const showToast = useCallback((message: string, options: EnhancedToastOptions = {}) => {
    const { once, throttleKey, ...restOptions } = options
    
    // Handle "once" option
    if (once) {
      const onceKey = throttleKey || message
      if (shownOnce.current.has(onceKey)) {
        return
      }
      shownOnce.current.add(onceKey)
    }
    
    const result = enhancedToastManager.show(message, { throttleKey, ...restOptions })
    
    // Track toast usage
    if (result) {
      performanceMonitor.track('toast_shown', 1, 'toast')
    } else {
      performanceMonitor.track('toast_throttled', 1, 'toast')
    }
    
    return result
  }, [])
  
  const success = useCallback((message: string, options: EnhancedToastOptions = {}) => {
    return showToast(message, { ...options, type: 'success' })
  }, [showToast])
  
  const error = useCallback((message: string, options: EnhancedToastOptions = {}) => {
    return showToast(message, { ...options, type: 'error' })
  }, [showToast])
  
  const info = useCallback((message: string, options: EnhancedToastOptions = {}) => {
    return showToast(message, { ...options, type: 'info' })
  }, [showToast])
  
  const warning = useCallback((message: string, options: EnhancedToastOptions = {}) => {
    return showToast(message, { ...options, type: 'warning' })
  }, [showToast])
  
  const dismiss = useCallback((key?: string) => {
    enhancedToastManager.dismiss(key)
  }, [])
  
  const clear = useCallback(() => {
    enhancedToastManager.clear()
    shownOnce.current.clear()
  }, [])
  
  return {
    toast: showToast,
    success,
    error,
    info,
    warning,
    dismiss,
    clear
  }
}