'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { client, urlFor } from '@/lib/sanity'
import AudioPlayer from '@/components/audio/AudioPlayer'
import SocialShare from '@/components/SocialShare'
import { ErrorBoundary } from 'react-error-boundary'

// Import Web3 components conditionally to prevent client-side exceptions
const Web3ProducerData = ({ producer, onBeatsLoaded }) => {
  const [beats, setBeats] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  
  useEffect(() => {
    // Only attempt to load beats if we have a valid wallet address
    if (!producer?.walletAddress || !producer.walletAddress.startsWith('0x')) {
      return
    }
    
    const loadBeats = async () => {
      setIsLoading(true)
      try {
        // Dynamically import Web3 dependencies to prevent initialization errors
        const { readContract } = await import('wagmi/actions')
        const { config } = await import('@/lib/wagmi')
        const { beatNFTABI } = await import('@/abis')
        
        // Get producer's NFT balance
        const balance = await readContract(config, {
          address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
          abi: beatNFTABI,
          functionName: 'balanceOf',
          args: [producer.walletAddress]
        }).catch(() => BigInt(0))
        
        // For now, create mock data since we need to iterate through tokens
        const tokenIds = Array.from({ length: Number(balance || 0) }, (_, i) => BigInt(i + 1))
        
        // Fetch metadata for each token
        const beatPromises = tokenIds.map(async (tokenId) => {
          try {
            const tokenURI = await readContract(config, {
              address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
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
              genre: metadata.attributes?.find((attr) => attr.trait_type === 'Genre')?.value || 'Unknown',
              bpm: metadata.attributes?.find((attr) => attr.trait_type === 'BPM')?.value || 120,
              key: metadata.attributes?.find((attr) => attr.trait_type === 'Key')?.value || 'C',
              price: parseFloat(metadata.attributes?.find((attr) => attr.trait_type === 'Price')?.value || '0'),
              coverImageUrl: metadata.image?.replace('ipfs://', process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/'),
              audioUrl: metadata.animation_url?.replace('ipfs://', process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/'),
              stageName: producer.name
            }
          } catch (error) {
            console.warn('Failed to fetch metadata for token:', tokenId, error)
            return null
          }
        })
        
        const loadedBeats = (await Promise.all(beatPromises)).filter(Boolean)
        setBeats(loadedBeats)
        onBeatsLoaded(loadedBeats)
      } catch (error) {
        console.warn('Could not load producer beats from Web3:', error)
        setBeats([])
        onBeatsLoaded([])
      } finally {
        setIsLoading(false)
      }
    }
    
    loadBeats()
  }, [producer?.walletAddress, producer?.name, onBeatsLoaded])
  
  return null // This component only handles data fetching, not rendering
}

// Fallback component for error boundary
const ErrorFallback = () => (
  <div style={{ 
    padding: '2rem', 
    margin: '1rem 0', 
    backgroundColor: '#FEF2F2', 
    borderRadius: '0.5rem',
    color: '#B91C1C',
    textAlign: 'center'
  }}>
    <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
      Something went wrong loading Web3 data
    </h3>
    <p>We're still able to show basic producer information.</p>
  </div>
)

export default function ProducerPage() {
  const params = useParams()
  const producerId = params.id as string
  const [selectedGenre, setSelectedGenre] = useState('all')
  const [producer, setProducer] = useState(null)
  const [beats, setBeats] = useState([])
  const [loading, setLoading] = useState(true)
  const [web3Enabled, setWeb3Enabled] = useState(false)
  
  // Handle beats loaded from Web3 component
  const handleBeatsLoaded = (loadedBeats) => {
    setBeats(loadedBeats)
  }
  
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
        const sanityProducer = await client?.fetch(`
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
        `, { slug: producerId }).catch(() => null)
        
        if (sanityProducer && isMounted) {
          const producerData = {
            id: producerId,
            name: sanityProducer.name || 'Beat Creator',
            displayName: sanityProducer.name || 'Beat Creator',
            bio: sanityProducer.bio || 'Beat creator on BeatsChain platform.',
            location: sanityProducer.location || 'South Africa',
            genres: sanityProducer.genres || ['Hip Hop'],
            totalBeats: sanityProducer.stats?.totalBeats || 0,
            totalSales: sanityProducer.stats?.totalSales || 0,
            isVerified: sanityProducer.verified || false,
            profileImage: sanityProducer.profileImage ? urlFor(sanityProducer.profileImage).url() : null,
            coverImage: sanityProducer.coverImage ? urlFor(sanityProducer.coverImage).url() : null,
            walletAddress: sanityProducer.walletAddress || null
          }
          
          setProducer(producerData)
          setWeb3Enabled(!!producerData.walletAddress && producerData.walletAddress.startsWith('0x'))
          setLoading(false)
          return
        }
        
        // Fallback to Web3 profile
        if (typeof window !== 'undefined') {
          const profileKey = `web3_profile_${producerId.toLowerCase()}`
          const storedProfile = localStorage.getItem(profileKey)
          
          if (storedProfile && isMounted) {
            const profile = JSON.parse(storedProfile)
            const producerData = {
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
              coverImage: profile.coverImage || null,
              walletAddress: profile.walletAddress || null
            }
            
            setProducer(producerData)
            setWeb3Enabled(!!producerData.walletAddress && producerData.walletAddress.startsWith('0x'))
            setLoading(false)
            return
          }
        }
        
        // Default producer if not found
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
            coverImage: null,
            walletAddress: null
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
            coverImage: null,
            walletAddress: null
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

  const genres = [
    'all', 'amapiano', 'afrobeats', 'house', 'deep-house', 'tech-house', 'trap', 
    'hip-hop', 'drill', 'gqom', 'kwaito', 'electronic', 'techno', 'progressive',
    'trance', 'dubstep', 'drum-bass', 'garage', 'breakbeat', 'ambient'
  ]

  // Filter beats by selected genre
  const filteredBeats = selectedGenre === 'all' 
    ? beats 
    : beats.filter(beat => beat.genre?.toLowerCase() === selectedGenre)

  return (
    <div>
      {/* Web3 Data Fetching Component */}
      {!loading && producer && web3Enabled && (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Web3ProducerData producer={producer} onBeatsLoaded={handleBeatsLoaded} />
        </ErrorBoundary>
      )}
      
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
              Beats Collection ({filteredBeats?.length || 0})
            </h2>
          </div>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#6b7280' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎵</div>
              <p>Loading beats...</p>
            </div>
          ) : !filteredBeats || filteredBeats.length === 0 ? (
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
              {filteredBeats.map((beat) => (
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