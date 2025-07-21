'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { client, urlFor } from '@/lib/sanity'
import { useReadContract } from 'wagmi'
import { beatNFTABI } from '@/abis'
import AudioPlayer from '@/components/audio/AudioPlayer'
import SocialShare from '@/components/SocialShare'

export default function ProducerPage() {
  const params = useParams()
  const producerId = params.id as string
  const [selectedGenre, setSelectedGenre] = useState('all')
  const [producer, setProducer] = useState<any>(null)
  const [beats, setBeats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)
  
  // Get producer's wallet address for Web3 data
  const producerAddress = producer?.walletAddress || '0x0000000000000000000000000000000000000000'
  
  // Fetch producer's beat count from contract
  const { data: beatCount } = useReadContract({
    address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
    abi: beatNFTABI,
    functionName: 'balanceOf',
    args: [producerAddress],
    query: { enabled: !!producerAddress && producerAddress !== '0x0000000000000000000000000000000000000000' }
  })
  
  // Fetch producer's total sales from contract events (using balanceOf for now)
  const { data: totalSales } = useReadContract({
    address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
    abi: beatNFTABI,
    functionName: 'balanceOf',
    args: [producerAddress],
    query: { enabled: !!producerAddress && producerAddress !== '0x0000000000000000000000000000000000000000' }
  })
  
  useEffect(() => {
    let isMounted = true
    
    const loadProducerData = async () => {
      if (!producerId || typeof producerId !== 'string') {
        console.warn('Invalid producer ID:', producerId)
        setLoading(false)
        return
      }
      
      try {
        // Try Sanity first
        const sanityProducer = await client.fetch(`
          *[_type == "producer" && slug.current == $slug][0] {
            name,
            slug,
            bio,
            location,
            genres,
            profileImage,
            coverImage,
            verified,
            socialLinks,
            walletAddress,
            stats
          }
        `, { slug: producerId })
        
        if (sanityProducer && isMounted) {
          setProducer({
            id: producerId,
            name: sanityProducer.name || 'Beat Creator',
            displayName: sanityProducer.name || 'Beat Creator',
            bio: sanityProducer.bio || 'Beat creator on BeatsChain platform.',
            location: sanityProducer.location || 'South Africa',
            genres: sanityProducer.genres || ['Hip Hop'],
            totalBeats: Number(beatCount) || sanityProducer.stats?.totalBeats || 0,
            totalSales: Number(totalSales) || sanityProducer.stats?.totalSales || 0,
            isVerified: sanityProducer.verified || false,
            profileImage: sanityProducer.profileImage ? urlFor(sanityProducer.profileImage).url() : null,
            coverImage: sanityProducer.coverImage ? urlFor(sanityProducer.coverImage).url() : null,
            walletAddress: sanityProducer.walletAddress || null
          })
          setLoading(false)
          return
        }
        
        // Fallback to Web3 profile
        const profileKey = `web3_profile_${producerId.toLowerCase()}`
        const storedProfile = localStorage.getItem(profileKey)
        
        if (storedProfile && isMounted) {
          const profile = JSON.parse(storedProfile)
          setProducer({
            id: producerId,
            name: profile.displayName || 'Beat Creator',
            displayName: profile.displayName || 'Beat Creator',
            bio: profile.bio || 'Beat creator on BeatsChain platform.',
            location: profile.location || 'South Africa',
            genres: profile.genres || ['Hip Hop'],
            totalBeats: 0,
            totalSales: 0,
            isVerified: profile.isVerified || false,
            profileImage: profile.profileImage || null,
            coverImage: profile.coverImage || null
          })
          
          // Beats will be loaded in separate useEffect
          
          setLoading(false)
        } else if (isMounted) {
          // Default producer if not found
          setProducer({
            id: producerId,
            name: 'Beat Creator',
            displayName: 'Beat Creator',
            bio: 'Beat creator on BeatsChain platform.',
            location: 'South Africa',
            genres: ['Hip Hop'],
            totalBeats: 0,
            totalSales: 0,
            isVerified: false,
            profileImage: null,
            coverImage: null
          })
          setBeats([])
          setLoading(false)
        }
      } catch (error) {
        console.error('Error loading producer data:', error)
        if (isMounted) {
          setProducer({
            id: producerId,
            name: 'Beat Creator',
            displayName: 'Beat Creator',
            bio: 'Beat creator on BeatsChain platform.',
            location: 'South Africa',
            genres: ['Hip Hop'],
            totalBeats: 0,
            totalSales: 0,
            isVerified: false,
            profileImage: null,
            coverImage: null
          })
          setBeats([])
          setLoading(false)
        }
      }
    }
    
    loadProducerData()
    
    return () => {
      isMounted = false
    }
  }, [producerId])
  
  // Separate effect for loading beats when producer data is available
  useEffect(() => {
    if (!producer?.walletAddress || !producer.walletAddress.startsWith('0x')) return
    
    const loadBeats = async () => {
      try {
        const { readContract } = await import('wagmi/actions')
        const { config } = await import('@/lib/wagmi')
        
        // Get producer's NFT balance
        const balance = await readContract(config, {
          address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
          abi: beatNFTABI,
          functionName: 'balanceOf',
          args: [producer.walletAddress as `0x${string}`]
        })
        
        // For now, create mock data since we need to iterate through tokens
        const tokenIds = Array.from({ length: Number(balance) }, (_, i) => BigInt(i + 1))
        
        // Fetch metadata for each token
        const beatPromises = tokenIds.map(async (tokenId: bigint) => {
          try {
            const tokenURI = await readContract(config, {
              address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
              abi: beatNFTABI,
              functionName: 'tokenURI',
              args: [tokenId]
            })
            
            // Fetch IPFS metadata
            const ipfsUrl = tokenURI.replace('ipfs://', process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/')
            const response = await fetch(ipfsUrl)
            const metadata = await response.json()
            
            return {
              id: tokenId.toString(),
              title: metadata.name || 'Untitled Beat',
              genre: metadata.attributes?.find((attr: any) => attr.trait_type === 'Genre')?.value || 'Unknown',
              bpm: metadata.attributes?.find((attr: any) => attr.trait_type === 'BPM')?.value || 120,
              key: metadata.attributes?.find((attr: any) => attr.trait_type === 'Key')?.value || 'C',
              price: parseFloat(metadata.attributes?.find((attr: any) => attr.trait_type === 'Price')?.value || '0'),
              coverImageUrl: metadata.image?.replace('ipfs://', process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/'),
              audioUrl: metadata.animation_url?.replace('ipfs://', process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/'),
              stageName: producer.name
            }
          } catch (error) {
            console.warn('Failed to fetch metadata for token:', tokenId, error)
            return null
          }
        })
        
        const beats = (await Promise.all(beatPromises)).filter(Boolean)
        setBeats(beats)
      } catch (error) {
        console.warn('Could not load producer beats from Web3:', error)
        setBeats([])
      }
    }
    
    loadBeats()
  }, [producer?.walletAddress, producer?.name])

  const genres = [
    'all', 'amapiano', 'afrobeats', 'house', 'deep-house', 'tech-house', 'trap', 
    'hip-hop', 'drill', 'gqom', 'kwaito', 'electronic', 'techno', 'progressive',
    'trance', 'dubstep', 'drum-bass', 'garage', 'breakbeat', 'ambient'
  ]

  return (
    <div>
      {/* Hero Section */}
      <div style={{
        height: '400px',
        background: producer?.coverImage 
          ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${producer.coverImage})`
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'end',
        padding: '2rem',
        color: 'white'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: producer?.profileImage 
                ? `url(${producer.profileImage})` 
                : 'rgba(255,255,255,0.2)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: '2rem'
            }}>
              {!producer?.profileImage && '🎵'}
            </div>
            <div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0 }}>
                {producer?.name || 'Beat Creator'} {producer?.isVerified ? ' ✓' : ''}
              </h1>
              <p style={{ fontSize: '1.125rem', opacity: 0.9, margin: 0 }}>
                {producer?.location || 'Unknown'} • {beats?.length || 0} beats • {producer?.totalSales || 0} sales
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        {/* Bio & Social Sharing */}
        <div style={{
          background: 'white', padding: '2rem', borderRadius: '0.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '2rem', border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937' }}>About</h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <SocialShare size="sm" title={`Check out ${producer?.name || 'this producer'} on BeatsChain`} />
            </div>
          </div>
          <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
            {producer?.bio || 'Beat creator on BeatsChain platform.'}
          </p>
        </div>

        {/* Genre Filters */}
        <div style={{
          background: 'white', padding: '1.5rem', borderRadius: '0.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '2rem', border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>Filter by Genre</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {genres.map(genre => (
              <button key={genre} onClick={() => setSelectedGenre(genre)} style={{
                padding: '0.5rem 1rem', borderRadius: '1rem', border: 'none',
                background: selectedGenre === genre ? '#3b82f6' : '#f3f4f6',
                color: selectedGenre === genre ? 'white' : '#6b7280',
                cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500', textTransform: 'capitalize'
              }}>
                {genre.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Beats Collection */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937' }}>
              Beats Collection ({beats?.length || 0})
            </h2>
          </div>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#6b7280' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎵</div>
              <p>Loading beats...</p>
            </div>
          ) : !beats || beats.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#6b7280' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎵</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1f2937' }}>No beats uploaded yet</h3>
              <p>This beat creator hasn't uploaded any beats to the platform yet.</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1.5rem'
            }}>
              {beats.map((beat) => (
                <div key={beat.id} style={{
                  background: 'white',
                  borderRadius: '0.5rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  border: '1px solid #e5e7eb',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '200px',
                    background: beat.coverImageUrl ? `url(${beat.coverImageUrl})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '3rem'
                  }}>
                    {!beat.coverImageUrl && '🎵'}
                  </div>
                  <div style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1f2937' }}>
                      {beat.title}
                    </h3>
                    <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                      {beat.stageName && <span style={{ fontWeight: '500' }}>by {beat.stageName}</span>}
                    </p>
                    <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem' }}>
                      {beat.genre} • {beat.bpm} BPM • {beat.key}
                    </p>
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div>
                          <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#059669' }}>
                            {beat.price.toFixed(3)} ETH
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                            ~R{Math.round(beat.price * 18000).toLocaleString()}
                          </div>
                        </div>
                        <a 
                          href={`/beatnfts?beat=${beat.id}`}
                          style={{
                            background: '#059669',
                            color: 'white',
                            padding: '0.5rem 1rem',
                            border: 'none',
                            borderRadius: '0.375rem',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            textDecoration: 'none',
                            display: 'inline-block',
                            textAlign: 'center'
                          }}
                        >
                          Buy Now
                        </a>
                      </div>
                      
                      {/* Audio Player */}
                      {beat.audioUrl && (
                        <AudioPlayer
                          beat={{
                            id: beat.id,
                            title: beat.title,
                            genre: beat.genre,
                            bpm: beat.bpm,
                            key: beat.key,
                            audioUrl: beat.audioUrl,
                            coverImageUrl: beat.coverImageUrl,
                            stageName: beat.stageName
                          }}
                          previewMode={true}
                          showWaveform={false}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}