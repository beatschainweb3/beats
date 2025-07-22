'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import SocialShare from '@/components/SocialShare'
import AudioPlayer from '@/components/audio/AudioPlayer'
import { dataProvider } from '@/adapters/unifiedDataProvider'
import { Beat, Producer } from '@/types/data'

export default function ProducerPage() {
  const params = useParams()
  const producerId = params.id as string
  const [selectedGenre, setSelectedGenre] = useState('all')
  const [producer, setProducer] = useState<Producer | null>(null)
  const [beats, setBeats] = useState<Beat[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    async function loadData() {
      if (!producerId || typeof producerId !== 'string') {
        console.warn('Invalid producer ID:', producerId)
        setLoading(false)
        return
      }
      
      try {
        // Get producer data from unified provider
        const producerData = await dataProvider.getProducer(producerId)
        
        if (producerData) {
          setProducer(producerData)
          
          try {
            // Get producer beats in a separate try/catch block
            const beatsData = await dataProvider.getProducerBeats(producerId)
            if (Array.isArray(beatsData)) {
              setBeats(beatsData)
            }
          } catch (beatsError) {
            console.error('Error loading producer beats:', beatsError)
            // Keep the producer data but show empty beats
            setBeats([])
          }
        }
      } catch (error) {
        console.error('Error loading producer data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [producerId])

  const genres = [
    'all', 'amapiano', 'afrobeats', 'house', 'deep-house', 'tech-house', 'trap', 
    'hip-hop', 'drill', 'gqom', 'kwaito', 'electronic', 'techno', 'progressive',
    'trance', 'dubstep', 'drum-bass', 'garage', 'breakbeat', 'ambient'
  ]

  // Filter beats by selected genre
  const filteredBeats = selectedGenre === 'all' 
    ? beats 
    : beats.filter(beat => beat.genre?.toLowerCase() === selectedGenre.toLowerCase())

  // Show loading state
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#6b7280' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎵</div>
        <p>Loading producer data...</p>
      </div>
    )
  }

  // Show not found state if no producer data
  if (!producer) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#6b7280' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎵</div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1f2937' }}>
          Producer not found
        </h3>
        <p>The producer you're looking for doesn't exist or has been removed.</p>
        <a 
          href="/producers"
          style={{
            display: 'inline-block',
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            background: '#3b82f6',
            color: 'white',
            borderRadius: '0.375rem',
            textDecoration: 'none'
          }}
        >
          Browse All Producers
        </a>
      </div>
    )
  }

  return (
    <div>
      {/* Hero Section */}
      <div style={{
        height: '400px',
        background: producer.coverImageUrl 
          ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${producer.coverImageUrl})`
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
              background: producer.profileImageUrl 
                ? `url(${producer.profileImageUrl})` 
                : 'rgba(255,255,255,0.2)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: '2rem'
            }}>
              {!producer.profileImageUrl && '🎵'}
            </div>
            <div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0 }}>
                {producer.name} {producer.verified ? ' ✓' : ''}
              </h1>
              <p style={{ fontSize: '1.125rem', opacity: 0.9, margin: 0 }}>
                {producer.location || 'Unknown'} • {beats?.length || 0} beats • {producer.totalSales || 0} sales
              </p>
              <p style={{ fontSize: '0.875rem', opacity: 0.8, margin: '0.5rem 0 0 0' }}>
                {producer.genres && producer.genres.length > 0 ? producer.genres.join(', ') : 'Various Genres'}
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
              <SocialShare size="sm" title={`Check out ${producer.name} on BeatsChain`} />
            </div>
          </div>
          <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
            {producer.bio || 'Beat creator on BeatsChain platform.'}
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
          
          {!filteredBeats || filteredBeats.length === 0 ? (
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
                      {beat.producerName && <span style={{ fontWeight: '500' }}>by {beat.producerName}</span>}
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
                        <div style={{ marginTop: '1rem' }}>
                          <AudioPlayer
                            beat={{
                              id: beat.id,
                              title: beat.title,
                              genre: beat.genre,
                              bpm: beat.bpm,
                              key: beat.key,
                              audioUrl: beat.audioUrl,
                              coverImageUrl: beat.coverImageUrl,
                              producerName: beat.producerName,
                              price: beat.price,
                              isNFT: beat.isNFT || false
                            }}
                            previewMode={true}
                            showWaveform={false}
                          />
                        </div>
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