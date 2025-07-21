'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAccount, useReadContract, usePublicClient } from 'wagmi'
import { BeatNFTConfig } from '@/contracts/BeatNFT'
import { formatEther } from 'viem'

// Define Beat type
interface Beat {
  id: string
  tokenId?: string
  title: string
  description: string
  price: number
  genre: string
  bpm: number
  producerId: string
  coverImageUrl: string
  audioUrl?: string
  isActive: boolean
  tags?: string[]
}

interface Web3DataContextType {
  beats: Beat[]
  loading: boolean
  refreshBeats: () => Promise<void>
}

const Web3DataContext = createContext<Web3DataContextType | undefined>(undefined)

// Metadata API endpoint
const METADATA_API = 'https://api.beatschain.app/metadata'

export function Web3DataProvider({ children }: { children: ReactNode }) {
  const [beats, setBeats] = useState<Beat[]>([])
  const [loading, setLoading] = useState(true)
  const { address } = useAccount()
  const publicClient = usePublicClient()

  const refreshBeats = async () => {
    setLoading(true)
    try {
      // Fetch beats from blockchain and metadata API
      const beatData = await fetchBeatsData()
      setBeats(beatData)
    } catch (error) {
      console.error('Failed to fetch beats:', error)
      setBeats([])
    } finally {
      setLoading(false)
    }
  }

  const fetchBeatsData = async (): Promise<Beat[]> => {
    try {
      // Try to fetch from blockchain
      if (publicClient) {
        try {
          // Get total supply
          const totalSupply = await publicClient.readContract({
            address: BeatNFTConfig.address[11155111] as `0x${string}`,
            abi: BeatNFTConfig.abi,
            functionName: 'totalSupply',
          }) as bigint

          if (totalSupply > 0n) {
            const beatPromises = []
            
            // Fetch each beat
            for (let i = 1n; i <= totalSupply; i++) {
              beatPromises.push(fetchBeatData(i))
            }
            
            const beatsData = await Promise.all(beatPromises)
            return beatsData.filter(Boolean) as Beat[]
          }
        } catch (err) {
          console.warn('Failed to fetch from blockchain, using local storage')
        }
      }
      
      // Fallback to local storage
      return getLocalBeats()
    } catch (error) {
      console.error('Error in fetchBeatsData:', error)
      return getLocalBeats()
    }
  }

  const fetchBeatData = async (tokenId: bigint): Promise<Beat | null> => {
    try {
      // Get beat data from contract
      const beatData = await publicClient?.readContract({
        address: BeatNFTConfig.address[11155111] as `0x${string}`,
        abi: BeatNFTConfig.abi,
        functionName: 'beats',
        args: [tokenId]
      })
      
      if (!beatData) return null
      
      // Get token URI
      const tokenUri = await publicClient?.readContract({
        address: BeatNFTConfig.address[11155111] as `0x${string}`,
        abi: BeatNFTConfig.abi,
        functionName: 'tokenURI',
        args: [tokenId]
      }) as string
      
      // Fetch metadata
      let metadata
      try {
        const response = await fetch(tokenUri)
        metadata = await response.json()
      } catch (err) {
        // If metadata fetch fails, use local storage or defaults
        const localMetadata = localStorage.getItem(`beat_metadata_${tokenId.toString()}`)
        metadata = localMetadata ? JSON.parse(localMetadata) : {
          name: `Beat #${tokenId}`,
          description: 'No description available',
          image: 'https://placehold.co/400x400/purple/white?text=Beat',
          audio: '',
          attributes: []
        }
      }
      
      // Extract data from contract and metadata
      const price = formatEther(beatData[0] as bigint)
      const producer = beatData[1] as string
      const isForSale = beatData[3] as boolean
      const genre = beatData[4] as string
      const bpm = Number(beatData[5])
      
      // Build beat object
      return {
        id: tokenId.toString(),
        tokenId: tokenId.toString(),
        title: metadata.name,
        description: metadata.description,
        price: parseFloat(price),
        genre,
        bpm,
        producerId: producer,
        coverImageUrl: metadata.image,
        audioUrl: metadata.audio,
        isActive: isForSale,
        tags: metadata.attributes?.filter(attr => attr.trait_type === 'tag').map(attr => attr.value) || []
      }
    } catch (error) {
      console.error(`Error fetching beat ${tokenId}:`, error)
      return null
    }
  }

  const getLocalBeats = (): Beat[] => {
    try {
      // Try to get beats from local storage
      const localBeatsStr = localStorage.getItem('beats_data')
      if (localBeatsStr) {
        return JSON.parse(localBeatsStr)
      }
      
      // If no local storage data, return empty array
      return []
    } catch (error) {
      console.error('Error getting local beats:', error)
      return []
    }
  }

  useEffect(() => {
    refreshBeats()
  }, [address])

  return (
    <Web3DataContext.Provider value={{ beats, loading, refreshBeats }}>
      {children}
    </Web3DataContext.Provider>
  )
}

export function useWeb3Data() {
  const context = useContext(Web3DataContext)
  if (context === undefined) {
    console.warn('useWeb3Data must be used within a Web3DataProvider')
    return {
      beats: [],
      loading: false,
      refreshBeats: async () => {}
    }
  }
  return context
}