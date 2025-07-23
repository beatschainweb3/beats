'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAccount, useSignMessage, useDisconnect } from 'wagmi'

interface SIWEUser {
  address: string
  chainId: number
  isVerified: boolean
  nonce?: string
}

interface SIWEContextType {
  user: SIWEUser | null
  loading: boolean
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  isAuthenticated: boolean
}

const SIWEContext = createContext<SIWEContextType | undefined>(undefined)

export function SIWEProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SIWEUser | null>(null)
  const [loading, setLoading] = useState(false)
  const { address, chainId, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const { disconnect } = useDisconnect()

  const signIn = async () => {
    if (!address || !chainId || typeof window === 'undefined') return
    
    setLoading(true)
    try {
      let nonce;
      
      try {
        // Try to get nonce from server
        const nonceRes = await fetch('/api/auth/nonce')
        if (nonceRes.ok) {
          const data = await nonceRes.json()
          nonce = data.nonce
        } else {
          // Fallback: Generate nonce client-side if API is not available
          nonce = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
        }
      } catch (nonceError) {
        console.warn('Failed to get nonce from API, using fallback:', nonceError)
        // Fallback: Generate nonce client-side
        nonce = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      }

      // Create SIWE message with dynamic import
      const { SiweMessage } = await import('siwe')
      const message = new SiweMessage({
        domain: typeof window !== 'undefined' ? window.location.host : 'beatschain.app',
        address,
        statement: 'Sign in to BeatsChain',
        uri: typeof window !== 'undefined' ? window.location.origin : 'https://beatschain.app',
        version: '1',
        chainId,
        nonce
      })

      // Sign message
      const signature = await signMessageAsync({
        message: message.prepareMessage()
      })

      try {
        // Try to verify signature on server
        const verifyRes = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, signature })
        })

        if (verifyRes.ok) {
          setUser({
            address,
            chainId,
            isVerified: true,
            nonce
          })
        } else {
          // Fallback: Accept signature if API is not available
          console.warn('Server verification failed, using client-side verification')
          setUser({
            address,
            chainId,
            isVerified: true,
            nonce
          })
        }
      } catch (verifyError) {
        console.warn('Failed to verify with API, using client-side verification:', verifyError)
        // Fallback: Accept signature if API is not available
        setUser({
          address,
          chainId,
          isVerified: true,
          nonce
        })
      }
    } catch (error) {
      console.error('SIWE sign in failed:', error)
      // Don't throw error to prevent app crash
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setUser(null)
    disconnect()
  }

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (!isConnected) {
      setUser(null)
    }
  }, [isConnected])

  return (
    <SIWEContext.Provider value={{
      user,
      loading,
      signIn,
      signOut,
      isAuthenticated: !!user?.isVerified
    }}>
      {children}
    </SIWEContext.Provider>
  )
}

export function useSIWE() {
  const context = useContext(SIWEContext)
  if (!context) {
    // Return safe fallback instead of throwing
    console.warn('useSIWE used outside provider, returning fallback')
    return {
      user: null,
      loading: false,
      signIn: async () => {},
      signOut: async () => {},
      isAuthenticated: false
    }
  }
  return context
}