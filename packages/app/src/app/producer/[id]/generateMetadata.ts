import { Metadata } from 'next'
import { generateSocialMetadata } from '@/lib/socialShare'
import { client } from '@/lib/sanity-client'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    // Try to fetch producer data from Sanity
    let producer = null
    
    if (client) {
      try {
        producer = await client.fetch(`
          *[_type == "producer" && slug.current == $slug][0] {
            name,
            bio,
            profileImage,
            coverImage,
            verified
          }
        `, { slug: params.id })
      } catch (error) {
        console.warn('Failed to fetch producer from Sanity:', error)
      }
    }
    
    // If no producer found in Sanity, check local storage (for Web3 profiles)
    if (!producer && typeof window !== 'undefined') {
      const profileKey = `web3_profile_${params.id.toLowerCase()}`
      const storedProfile = localStorage.getItem(profileKey)
      
      if (storedProfile) {
        producer = JSON.parse(storedProfile)
      }
    }
    
    // If still no producer, create a fallback
    if (!producer) {
      producer = {
        name: 'Beat Creator',
        bio: 'Beat creator on BeatsChain platform.',
        profileImage: null,
        coverImage: null
      }
    }
    
    // Generate metadata with proper social sharing
    return generateSocialMetadata({
      title: `${producer.name} | BeatsChain Producer`,
      description: producer.bio || `Check out ${producer.name}'s beats on BeatsChain`,
      imageUrl: producer.profileImage || producer.coverImage,
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