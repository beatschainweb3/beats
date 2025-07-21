'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useWeb3Data } from '@/context/Web3DataContext'
import { LinkComponent } from '@/components/LinkComponent'
import { LoadingSpinner } from '@/components/LoadingStates'
import BeatAnalyticsCard from '@/components/BeatAnalyticsCard'

export default function BeatDetailPage() {
  const params = useParams()
  const beatId = params.id as string
  const { beats } = useWeb3Data()
  const [beat, setBeat] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const foundBeat = beats.find(b => b.id === beatId)
    setBeat(foundBeat)
    setLoading(false)
  }, [beatId, beats])

  const [shareUrl, setShareUrl] = useState('')
  const shareText = beat ? `Check out "${beat.title}" by ${beat.stageName} on BeatsChain` : ''
  
  // Set the URL on the client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(window.location.href)
    }
  }, [])

  if (loading) return <LoadingSpinner />
  if (!beat) return <div>Beat not found</div>

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <LinkComponent href="/browse" style={{ color: '#3b82f6' }}>
          ← Back to Browse
        </LinkComponent>
      </div>

      <div style={{ 
        background: 'white', 
        borderRadius: '1rem', 
        padding: '2rem',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '2rem', marginBottom: '2rem' }}>
          <img 
            src={beat.coverImageUrl} 
            alt={beat.title}
            style={{ width: '200px', height: '200px', borderRadius: '0.5rem', objectFit: 'cover' }}
          />
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              {beat.title}
            </h1>
            <p style={{ fontSize: '1.25rem', color: '#6b7280', marginBottom: '1rem' }}>
              by {beat.stageName}
            </p>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <span style={{ background: '#f3f4f6', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.875rem' }}>
                {beat.genre}
              </span>
              <span style={{ background: '#f3f4f6', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.875rem' }}>
                {beat.bpm} BPM
              </span>
              <span style={{ background: '#f3f4f6', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.875rem' }}>
                {beat.key}
              </span>
            </div>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#059669' }}>
              {beat.price} ETH
            </p>
          </div>
        </div>

        {beat.description && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>Description</h3>
            <p style={{ color: '#6b7280' }}>{beat.description}</p>
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button style={{
            background: '#3b82f6',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            border: 'none',
            fontWeight: '600',
            cursor: 'pointer'
          }}>
            🎵 Buy Beat
          </button>
          <button style={{
            background: '#f3f4f6',
            color: '#374151',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            border: 'none',
            fontWeight: '600',
            cursor: 'pointer'
          }}>
            ▶️ Preview
          </button>
        </div>

        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '2rem', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Share this Beat</h3>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#1da1f2',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontSize: '0.875rem'
              }}
            >
              🐦 Twitter
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#4267b2',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontSize: '0.875rem'
              }}
            >
              📘 Facebook
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#0077b5',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontSize: '0.875rem'
              }}
            >
              💼 LinkedIn
            </a>
          </div>
        </div>

        {/* Beat Analytics */}
        <BeatAnalyticsCard beatId={beatId} />
      </div>
    </div>
  )
}