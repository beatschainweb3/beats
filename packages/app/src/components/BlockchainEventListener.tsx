'use client'

import { useBlockchainEvents } from '@/hooks/useBlockchainEvents'

export default function BlockchainEventListener() {
  // Initialize the blockchain event listeners
  useBlockchainEvents()
  
  // This component doesn't render anything
  return null
}