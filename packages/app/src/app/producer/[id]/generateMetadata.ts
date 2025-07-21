import { Metadata } from 'next'
import { generateSocialMetadata } from '@/lib/socialShare'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    // Try to fetch producer data
    const { TestDataManager } = await import('@/utils/testData')
    const producers = TestDataManager.getTestProducers()
    const producer = producers.find(p => p.id === params.id)
    
    if (!producer) {
      return {
        title: 'Producer Not Found',
        description: 'The requested producer profile could not be found.'
      }
    }
    
    // Generate metadata with proper social sharing
    return generateSocialMetadata({
      title: `${producer.displayName || producer.name} - BeatsChain Producer`,
      description: producer.bio || `Check out ${producer.displayName || producer.name}'s beats on BeatsChain`,
      imageUrl: producer.profileImage,
      type: 'profile',
      path: `/producer/${params.id}`
    })
  } catch (error) {
    console.error('Error generating producer metadata:', error)
    
    // Fallback metadata
    return {
      title: 'BeatsChain Producer',
      description: 'Producer profile on BeatsChain - Web3 Beat Marketplace'
    }
  }
}