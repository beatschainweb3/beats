import { Metadata } from 'next'
import { generateSocialMetadata } from '@/lib/socialShare'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    // Try to fetch beat data
    const { TestDataManager } = await import('@/utils/testData')
    const beats = TestDataManager.getTestBeats()
    const beat = beats.find(b => b.id === params.id)
    
    if (!beat) {
      return {
        title: 'Beat Not Found',
        description: 'The requested beat could not be found.'
      }
    }
    
    // Generate metadata with proper social sharing
    return generateSocialMetadata({
      title: `${beat.title} - ${beat.genre} Beat by ${beat.producerName}`,
      description: beat.description || `Listen to this ${beat.genre} beat on BeatsChain`,
      imageUrl: beat.coverImageUrl,
      type: 'music',
      path: `/beat/${params.id}`
    })
  } catch (error) {
    console.error('Error generating beat metadata:', error)
    
    // Fallback metadata
    return {
      title: 'BeatsChain Beat',
      description: 'Listen to this beat on BeatsChain - Web3 Beat Marketplace'
    }
  }
}