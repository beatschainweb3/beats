import { Metadata } from 'next'
import { generateSocialMetadata } from '@/lib/socialShare'
import { SanityAdapter } from '@/adapters/sanityAdapter'

// Use only Sanity adapter for metadata to avoid client-side code
const sanityAdapter = new SanityAdapter()

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    // Get producer from Sanity
    const producer = await sanityAdapter.getProducer(params.id)
    
    // Generate metadata with proper social sharing
    return generateSocialMetadata({
      title: producer?.name ? `${producer.name} | BeatsChain Producer` : 'BeatsChain Producer',
      description: producer?.bio || 'Beat creator on BeatsChain platform.',
      imageUrl: producer?.profileImageUrl || producer?.coverImageUrl,
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