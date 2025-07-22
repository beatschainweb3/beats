import { Metadata } from 'next'
import { generateSocialMetadata } from '@/lib/socialShare'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    // Try to fetch beat data from Web3 or local storage
    let beat = null
    
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      // Try to get from localStorage first (for development/testing)
      const storedBeats = localStorage.getItem('beats_data')
      if (storedBeats) {
        const beats = JSON.parse(storedBeats)
        beat = beats.find(b => b.id === params.id)
      }
    }
    
    // If no beat found, create a fallback
    if (!beat) {
      beat = {
        id: params.id,
        title: `Beat #${params.id}`,
        description: 'Web3 beat on BeatsChain',
        coverImageUrl: null
      }
    }
    
    // Generate metadata with proper social sharing
    return generateSocialMetadata({
      title: beat.title,
      description: beat.description || `Check out this beat on BeatsChain`,
      imageUrl: beat.coverImageUrl,
      type: 'music',
      path: `/beat/${params.id}`
    })
  } catch (error) {
    console.error('Error generating beat metadata:', error)
    
    // Fallback metadata
    return {
      title: `Beat #${params.id} | BeatsChain`,
      description: 'Web3 beat on BeatsChain - Blockchain Beat Marketplace'
    }
  }
}