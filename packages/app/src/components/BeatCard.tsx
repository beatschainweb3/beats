'use client'

import { useState, useRef, useEffect } from 'react'
import { Beat } from '@/types'
import PurchaseModal from './purchase/PurchaseModal'
import LicenseNegotiationModal from './LicenseNegotiationModal'
import PriceDisplay from './PriceDisplay'
import OptimizedImage from './OptimizedImage'
import AudioWaveform from './AudioWaveform'
import { useUnifiedAuth } from '@/context/UnifiedAuthContext'
import { useContentCreator } from '@/hooks/useContentCreator'
import { useCreatorPreview } from '@/hooks/useCreatorPreview'
import { normalizeImageSource } from '@/utils/imageOptimization'
import { useToast } from '@/hooks/useToast'

interface BeatCardProps {
  beat: Beat
}

export default function BeatCard({ beat }: BeatCardProps) {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [showNegotiationModal, setShowNegotiationModal] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useUnifiedAuth()
  const { isCreator } = useContentCreator()
  const { canPreviewFullBeat, previewReason, previewDuration } = useCreatorPreview()
  const { success, error, info } = useToast()
  const audioRef = useRef<HTMLAudioElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const previewLimitShown = useRef(false)

  // Audio player functionality with creator preview limits
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => {
      setCurrentTime(audio.currentTime)
      
      // Limit preview for non-qualified creators
      if (!canPreviewFullBeat && previewDuration > 0 && audio.currentTime >= previewDuration && !previewLimitShown.current) {
        audio.pause()
        setIsPlaying(false)
        previewLimitShown.current = true
        info(`Preview limited to ${previewDuration}s. ${previewReason}`, { 
          throttleKey: `preview-limit-${beat.id}`,
          throttleMs: 30000 // 30 second throttle
        })
      }
    }
    
    const updateDuration = () => setDuration(audio.duration)
    const handleEnded = () => setIsPlaying(false)
    const handleLoadStart = () => setIsLoading(true)
    const handleCanPlay = () => setIsLoading(false)

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('loadstart', handleLoadStart)
    audio.addEventListener('canplay', handleCanPlay)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('loadstart', handleLoadStart)
      audio.removeEventListener('canplay', handleCanPlay)
    }
  }, [canPreviewFullBeat, previewDuration, previewReason])

  const togglePlay = async () => {
    const audio = audioRef.current
    if (!audio) return

    try {
      if (isPlaying) {
        audio.pause()
        setIsPlaying(false)
      } else {
        await audio.play()
        setIsPlaying(true)
      }
    } catch (audioError) {
      console.error('Audio play error:', audioError)
      error('Unable to play audio', { 
        throttleKey: `audio-error-${beat.id}`,
        throttleMs: 5000
      })
    }
  }

  const handleProgressClick = (newTime: number) => {
    const audio = audioRef.current
    if (!audio) return
    
    // Ensure time is within valid range
    const clampedTime = Math.max(0, Math.min(newTime, duration))
    audio.currentTime = clampedTime
  }

  const handlePurchase = () => {
    if (!user) {
      error('Please sign in to purchase beats', { 
        throttleKey: 'auth-required',
        throttleMs: 10000
      })
      return
    }
    setShowPurchaseModal(true)
  }

  const handlePurchaseComplete = (beatId: string, licenseType: string) => {
    const beatNftId = beat.beatNftId || beat.id // ✅ BeatNFT™ compatibility
    console.log(`Purchase completed: BeatNFT™ ${beatNftId} with ${licenseType} license`)
    setShowPurchaseModal(false)
    toast.success('BeatNFT™ purchase successful!', { toastId: `purchase-complete-${beatId}` })
  }

  const handleLike = () => {
    if (!user) {
      error('Please sign in to like beats', { 
        throttleKey: 'auth-required',
        throttleMs: 10000
      })
      return
    }
    const newLikedState = !isLiked
    setIsLiked(newLikedState)
    success(newLikedState ? 'Added to favorites' : 'Removed from favorites', { 
      throttleKey: `like-${beat.id}`,
      throttleMs: 2000
    })
  }

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }



  return (
    <>
      <div style={{
        background: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb', overflow: 'hidden'
      }}>
        <div style={{
          height: '200px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontSize: '1.125rem', fontWeight: '600'
        }}>
          {beat.coverImageUrl ? (
            <OptimizedImage 
              src={normalizeImageSource(beat.coverImageUrl)} 
              alt={beat.title} 
              fill 
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="w-full h-full object-cover"
            />
          ) : (
            <span>🎵 {beat.title}</span>
          )}
        </div>
        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.25rem' }}>
                {beat.title}
              </h3>
              {beat.isNFT && (
                <div style={{ display: 'inline-block', background: '#ddd6fe', color: '#7c3aed', padding: '0.125rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                  BeatNFT™ #{beat.beatNftId || beat.id}
                </div>
              )}
              {beat.stageName && (
                <p style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                  by {beat.stageName}
                </p>
              )}
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                {beat.bpm} BPM • {beat.key}
              </p>
            </div>
            <PriceDisplay 
              ethPrice={beat.price} 
              showBoth={true} 
              primary="ETH"
              className="text-right"
            />
          </div>
          
          {/* Enhanced Audio Player */}
          <div style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '0.375rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <button onClick={togglePlay} disabled={isLoading} style={{
                background: '#3b82f6', color: 'white', border: 'none', borderRadius: '50%',
                width: '2.5rem', height: '2.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {isLoading ? (
                  <div style={{ width: '16px', height: '16px', border: '2px solid white', borderTop: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                ) : isPlaying ? '⏸' : '▶'}
              </button>
              <div style={{ flex: 1, height: '40px', cursor: 'pointer' }}>
                <AudioWaveform
                  audioUrl={beat.audioUrl}
                  currentTime={currentTime}
                  duration={duration}
                  previewDuration={!canPreviewFullBeat ? previewDuration : -1}
                  onSeek={handleProgressClick}
                  className="w-full h-full"
                />
              </div>
              <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                {formatTime(currentTime)} / {canPreviewFullBeat ? formatTime(duration) : `${previewDuration}s`}
                {canPreviewFullBeat && (
                  <span style={{ color: '#7c3aed', marginLeft: '4px' }}>🎨 Full</span>
                )}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}>🔄</button>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}>🔀</button>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}>🔊</button>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                <span>1.2K plays</span>
                {!canPreviewFullBeat && (
                  <div style={{ color: '#7c3aed', marginTop: '2px' }}>
                    {previewReason}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {isCreator ? (
              <>
                <button onClick={() => setShowNegotiationModal(true)} style={{
                  flex: 1, background: '#7c3aed', color: 'white', padding: '0.75rem',
                  border: 'none', borderRadius: '0.375rem', fontWeight: '500', cursor: 'pointer'
                }}>🤝 Negotiate License</button>
                <button onClick={handlePurchase} style={{
                  padding: '0.75rem', background: '#3b82f6', color: 'white',
                  border: 'none', borderRadius: '0.375rem', fontWeight: '500', cursor: 'pointer'
                }}>💰</button>
              </>
            ) : (
              <button onClick={handlePurchase} style={{
                flex: 1, background: '#3b82f6', color: 'white', padding: '0.75rem',
                border: 'none', borderRadius: '0.375rem', fontWeight: '500', cursor: 'pointer'
              }}>{beat.isNFT ? 'Purchase BeatNFT™' : 'Purchase Beat'}</button>
            )}
            <button onClick={handleLike} style={{
              padding: '0.75rem', background: isLiked ? '#fef2f2' : 'white', 
              border: `1px solid ${isLiked ? '#fca5a5' : '#d1d5db'}`,
              borderRadius: '0.375rem', cursor: 'pointer',
              color: isLiked ? '#dc2626' : '#6b7280'
            }}>{isLiked ? '♥' : '♡'}</button>
          </div>
        </div>
        
        {/* Hidden Audio Element */}
        {beat.audioUrl && (
          <audio
            ref={audioRef}
            src={beat.audioUrl}
            preload="metadata"
            onError={() => {
              console.warn('Audio failed to load:', beat.audioUrl)
              setIsLoading(false)
              toast.error('Audio preview not available', { toastId: `audio-load-error-${beat.id}` })
            }}
          />
        )}
      </div>

      {/* Purchase Modal */}
      <PurchaseModal
        beat={beat}
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        onPurchaseComplete={handlePurchaseComplete}
      />

      {/* License Negotiation Modal */}
      <LicenseNegotiationModal
        beat={beat}
        isOpen={showNegotiationModal}
        onClose={() => setShowNegotiationModal(false)}
        onSuccess={() => {
          toast.success('License negotiation submitted!', { toastId: `negotiation-${beat.id}` })
          setShowNegotiationModal(false)
        }}
      />
    </>
  )
}