'use client'

import { useBlockchainEvents } from '@/hooks/useBlockchainEvents'
import { useContractEvents } from '@/hooks/useContractEvents'

export default function BlockchainEventListener() {
  // Initialize the blockchain event listeners
  useBlockchainEvents()
  
  // Initialize contract event listeners
  useContractEvents()
  
  // This component doesn't render anything
  return null
}