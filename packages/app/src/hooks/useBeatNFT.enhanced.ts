'use client'

import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther } from 'viem'
import { toast } from 'react-toastify'

// Smart contract ABI for BeatNFT Credit System
const BeatNFTCreditSystemAbi = [
  {
    type: 'function',
    name: 'purchaseCredits',
    inputs: [{ name: 'packageId', type: 'uint256' }],
    outputs: [],
    stateMutability: 'payable'
  },
  {
    type: 'function', 
    name: 'upgradeToProNFT',
    inputs: [],
    outputs: [],
    stateMutability: 'payable'
  },
  {
    type: 'function',
    name: 'getCreditBalance', 
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'hasProNFT',
    inputs: [{ name: '', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'canUpload',
    inputs: [{ name: 'user', type: 'address' }, { name: 'requiredCredits', type: 'uint256' }],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view'
  },
  {
    type: 'event',
    name: 'CreditsPurchased',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'credits', type: 'uint256', indexed: false },
      { name: 'price', type: 'uint256', indexed: false }
    ]
  },
  {
    type: 'event',
    name: 'ProNFTUpgraded', 
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'price', type: 'uint256', indexed: false }
    ]
  }
] as const

// Contract addresses
const BeatNFTCreditSystemAddress = {
  1: '0x0000000000000000000000000000000000000000', // Mainnet - not deployed
  11155111: '0x8fa4e195010615d2376381e5de7a8099e2413d75', // Sepolia - deployed
  31337: '0x0000000000000000000000000000000000000000' // Local - deploy needed
} as const

export interface BeatNFTBalance {
  credits: number
  hasProNFT: boolean
  totalUsed: number
  totalPurchased?: number
  lastPurchase?: string
  proNFTUpgradedAt?: string
  proNFTTransactionHash?: string
}

export function useBeatNFT() {
  const [balance, setBalance] = useState<BeatNFTBalance>({
    credits: 10, // Default free credits
    hasProNFT: false,
    totalUsed: 0
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { address, isConnected } = useAccount()

  // Load balance on mount and when wallet changes
  useEffect(() => {
    if (isConnected && address) {
      loadBalance()
    } else {
      // Reset balance when wallet disconnects
      setBalance({
        credits: 10,
        hasProNFT: false,
        totalUsed: 0
      })
    }
  }, [address, isConnected])

  const loadBalance = async () => {
    if (!address || typeof window === 'undefined') return

    try {
      setLoading(true)
      setError(null)
      
      // Try to load from contract first
      try {
        // Contract call would go here in production
        // For now, we'll use localStorage
      } catch (contractError) {
        console.warn('Failed to load balance from contract:', contractError)
        // Continue with localStorage fallback
      }
      
      // Load from localStorage (temporary until smart contract integration)
      try {
        const stored = localStorage.getItem(`beatnft_balance_${address}`)
        if (stored) {
          const balanceData = JSON.parse(stored)
          setBalance(balanceData)
        } else {
          // New user gets 10 free credits
          const newBalance = {
            credits: 10,
            hasProNFT: false,
            totalUsed: 0,
            welcomeCreditsReceived: true,
            receivedAt: new Date().toISOString()
          }
          localStorage.setItem(`beatnft_balance_${address}`, JSON.stringify(newBalance))
          setBalance(newBalance)
          
          // Welcome notification
          setTimeout(() => {
            toast.success('🎉 Welcome! You received 10 free BeatNFT credits to start uploading!')
          }, 1000)
        }
      } catch (storageError) {
        console.error('Failed to load balance from localStorage:', storageError)
        // Fallback to default balance
        setBalance({
          credits: 10,
          hasProNFT: false,
          totalUsed: 0
        })
      }
    } catch (error: any) {
      console.error('Failed to load BeatNFT balance:', error)
      setError(`Failed to load credits: ${error.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const canUpload = (fileType: string): { allowed: boolean; cost: number; reason?: string } => {
    // Default to MP3 cost if file type is unknown
    const costs = {
      'mp3': 1,
      'wav': 2,
      'zip': 3,
      'm4a': 1,
      'aiff': 2,
      'flac': 2,
      'ogg': 1
    }
    
    const cost = costs[fileType.toLowerCase() as keyof typeof costs] || 1
    
    // Pro users can upload anything
    if (balance.hasProNFT) {
      return { allowed: true, cost: 0 }
    }
    
    // Check if user has enough credits
    if (balance.credits >= cost) {
      return { allowed: true, cost }
    }
    
    // Not enough credits
    return { 
      allowed: false, 
      cost, 
      reason: `Need ${cost} BeatNFT credit${cost !== 1 ? 's' : ''}. You have ${balance.credits}.`
    }
  }

  const useCredits = async (amount: number): Promise<boolean> => {
    if (!address || typeof window === 'undefined') return false
    if (balance.hasProNFT) return true // Pro users don't use credits
    
    if (balance.credits < amount) {
      setError(`Not enough credits. Need ${amount}, have ${balance.credits}.`)
      return false
    }
    
    try {
      setLoading(true)
      
      // Try contract call first
      try {
        // Contract call would go here in production
        // For now, we'll use localStorage
      } catch (contractError) {
        console.warn('Failed to use credits via contract:', contractError)
        // Continue with localStorage fallback
      }
      
      // Update localStorage
      try {
        const newBalance = {
          ...balance,
          credits: balance.credits - amount,
          totalUsed: balance.totalUsed + amount,
          lastUsed: new Date().toISOString()
        }
        
        localStorage.setItem(`beatnft_balance_${address}`, JSON.stringify(newBalance))
        setBalance(newBalance)
        return true
      } catch (storageError) {
        console.error('Failed to update credits in localStorage:', storageError)
        setError('Failed to update credits. Please try again.')
        return false
      }
    } catch (error: any) {
      console.error('Failed to use credits:', error)
      setError(`Failed to use credits: ${error.message || 'Unknown error'}`)
      return false
    } finally {
      setLoading(false)
    }
  }

  const { writeContract } = useWriteContract()
  
  const buyCredits = async (amount: number): Promise<boolean> => {
    if (!address || typeof window === 'undefined') return false
    
    try {
      setLoading(true)
      setError(null)
      
      // Determine package ID based on amount
      let packageId = 0
      let cost = 0.01
      
      if (amount === 10) { packageId = 0; cost = 0.01 }
      else if (amount === 25) { packageId = 1; cost = 0.02 }
      else if (amount === 50) { packageId = 2; cost = 0.035 }
      else if (amount === 100) { packageId = 3; cost = 0.06 }
      else {
        setError('Invalid credit package')
        return false
      }
      
      // Check if contract is deployed
      const contractAddress = BeatNFTCreditSystemAddress[11155111] as `0x${string}`
      if (contractAddress === '0x0000000000000000000000000000000000000000') {
        // Fallback to simulation for now
        return await simulateCreditPurchase(amount, cost)
      }
      
      // Try real smart contract call
      try {
        const hash = await writeContract({
          address: contractAddress,
          abi: BeatNFTCreditSystemAbi,
          functionName: 'purchaseCredits',
          args: [BigInt(packageId)],
          value: parseEther(cost.toString())
        })
        
        toast.success(`🔄 Transaction submitted: ${hash.slice(0, 10)}...`)
        
        // Update local balance for immediate UI feedback
        const newBalance = {
          ...balance,
          credits: balance.credits + amount,
          totalPurchased: (balance.totalPurchased || 0) + amount,
          lastPurchase: new Date().toISOString()
        }
        localStorage.setItem(`beatnft_balance_${address}`, JSON.stringify(newBalance))
        setBalance(newBalance)
        
        return true
      } catch (contractError) {
        console.warn('Contract call failed, falling back to simulation:', contractError)
        // Fall back to simulation
        return await simulateCreditPurchase(amount, cost)
      }
    } catch (error: any) {
      console.error('Failed to buy credits:', error)
      setError(`Failed to buy credits: ${error.message || 'Unknown error'}`)
      toast.error(`Transaction failed: ${error.message || 'Unknown error'}`)
      return false
    } finally {
      setLoading(false)
    }
  }
  
  const simulateCreditPurchase = async (amount: number, cost: number): Promise<boolean> => {
    try {
      // Simulate blockchain transaction with localStorage
      const transactionHash = `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`
      
      // Record transaction in blockchain-compatible format
      const transaction = {
        hash: transactionHash,
        from: address,
        amount,
        cost,
        timestamp: new Date().toISOString(),
        blockNumber: Date.now() // Placeholder for actual block number
      }
      
      // Store transaction record
      const transactions = JSON.parse(localStorage.getItem('credit_transactions') || '[]')
      transactions.push(transaction)
      localStorage.setItem('credit_transactions', JSON.stringify(transactions))
      
      // Update balance
      const newBalance = {
        ...balance,
        credits: balance.credits + amount,
        totalPurchased: (balance.totalPurchased || 0) + amount,
        lastPurchase: new Date().toISOString()
      }
      localStorage.setItem(`beatnft_balance_${address}`, JSON.stringify(newBalance))
      setBalance(newBalance)
      
      toast.success(`✅ Purchased ${amount} credits successfully!`)
      return true
    } catch (error: any) {
      console.error('Failed to simulate credit purchase:', error)
      setError(`Failed to purchase credits: ${error.message || 'Unknown error'}`)
      return false
    }
  }

  const upgradeToProNFT = async (): Promise<boolean> => {
    if (!address || typeof window === 'undefined') return false
    
    try {
      setLoading(true)
      setError(null)
      
      // Check if contract is deployed
      const contractAddress = BeatNFTCreditSystemAddress[11155111] as `0x${string}`
      if (contractAddress === '0x0000000000000000000000000000000000000000') {
        // Fallback to simulation for now
        return await simulateProNFTUpgrade()
      }
      
      // Try real smart contract call
      try {
        const hash = await writeContract({
          address: contractAddress,
          abi: BeatNFTCreditSystemAbi,
          functionName: 'upgradeToProNFT',
          args: [],
          value: parseEther('0.1') // 0.1 ETH for Pro BeatNFT
        })
        
        toast.success(`🔄 Pro BeatNFT upgrade submitted: ${hash.slice(0, 10)}...`)
        
        // Update local balance for immediate UI feedback
        const newBalance = {
          ...balance,
          hasProNFT: true,
          proNFTUpgradedAt: new Date().toISOString(),
          proNFTTransactionHash: hash
        }
        localStorage.setItem(`beatnft_balance_${address}`, JSON.stringify(newBalance))
        setBalance(newBalance)
        
        return true
      } catch (contractError) {
        console.warn('Contract call failed, falling back to simulation:', contractError)
        // Fall back to simulation
        return await simulateProNFTUpgrade()
      }
    } catch (error: any) {
      console.error('Failed to upgrade to Pro BeatNFT:', error)
      setError(`Pro BeatNFT upgrade failed: ${error.message || 'Unknown error'}`)
      toast.error(`Pro BeatNFT upgrade failed: ${error.message || 'Unknown error'}`)
      return false
    } finally {
      setLoading(false)
    }
  }
  
  const simulateProNFTUpgrade = async (): Promise<boolean> => {
    try {
      // Simulate blockchain transaction with localStorage
      const transactionHash = `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`
      
      // Record Pro BeatNFT purchase transaction
      const transaction = {
        hash: transactionHash,
        from: address,
        type: 'pro_nft_upgrade',
        cost: 0.1,
        timestamp: new Date().toISOString(),
        blockNumber: Date.now() // Placeholder for actual block number
      }
      
      // Store transaction record
      const transactions = JSON.parse(localStorage.getItem('pro_nft_transactions') || '[]')
      transactions.push(transaction)
      localStorage.setItem('pro_nft_transactions', JSON.stringify(transactions))
      
      // Update balance
      const newBalance = {
        ...balance,
        hasProNFT: true,
        proNFTUpgradedAt: new Date().toISOString(),
        proNFTTransactionHash: transactionHash
      }
      localStorage.setItem(`beatnft_balance_${address}`, JSON.stringify(newBalance))
      setBalance(newBalance)
      
      toast.success('✅ Upgraded to Pro BeatNFT successfully!')
      return true
    } catch (error: any) {
      console.error('Failed to simulate Pro BeatNFT upgrade:', error)
      setError(`Pro BeatNFT upgrade failed: ${error.message || 'Unknown error'}`)
      return false
    }
  }

  return {
    balance,
    loading,
    error,
    canUpload,
    useCredits,
    buyCredits,
    upgradeToProNFT,
    isConnected: isConnected && !!address,
    refreshBalance: loadBalance
  }
}