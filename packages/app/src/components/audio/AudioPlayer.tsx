'use client'

import { useState, useRef, useEffect } from 'react'
import { Beat } from '@/types/data'

interface AudioPlayerProps {
  beat: Beat
  autoPlay?: boolean
  showWaveform?: boolean
  previewMode?: boolean // 30-second preview
  allowFullAccess?: boolean // Override for beat owners
}

export default function AudioPlayer({ 
  beat, 
  autoPlay = false, 
  showWaveform = false,
  previewMode = false,
  allowFullAccess = false
}: AudioPlayerProps) {
  const [hasUsedCredit, setHasUsedCredit] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [canPlay, setCanPlay] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleEnded = () => setIsPlaying(false)
    const handleCanPlay = () => {
      setCanPlay(true)
      setError(null)
    }
    const handleError = () => {
      setError('Unable to play audio')
      setCanPlay(false)
      setIsPlaying(false)
    }

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('error', handleError)

    // Preview mode: stop at 30 seconds
    if (previewMode) {
      const checkPreviewLimit = () => {
        if (audio.currentTime >= 30) {
          audio.pause()
          setIsPlaying(false)
        }
      }
      audio.addEventListener('timeupdate', checkPreviewLimit)
    }

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('error', handleError)
    }
  }, [previewMode])

  const togglePlay = async () => {
    const audio = audioRef.current
    if (!audio) return

    // Access control placeholder for future implementation
    if (!previewMode && !allowFullAccess && !hasUsedCredit) {
      // Future: implement access control
      setHasUsedCredit(true)
    }

    try {
      if (isPlaying) {
        audio.pause()
        setIsPlaying(false)
      } else {
        await audio.play()
        setIsPlaying(true)
      }
    } catch (err) {
      setError('Unable to play audio')
      setIsPlaying(false)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return

    const newTime = parseFloat(e.target.value)
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return

    const newVolume = parseFloat(e.target.value)
    audio.volume = newVolume
    setVolume(newVolume)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const maxTime = previewMode ? Math.min(duration, 30) : duration

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', padding: '1rem' }}>
      <audio
        ref={audioRef}
        src={beat.audioUrl}
        preload="metadata"
        autoPlay={autoPlay}
      />

      {/* Beat Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        {beat.coverImageUrl && (
          <img
            src={beat.coverImageUrl}
            alt={beat.title}
            style={{ width: '3rem', height: '3rem', borderRadius: '0.25rem', objectFit: 'cover' }}
          />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontWeight: 500, color: '#1f2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{beat.title}</h3>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            {beat.genre} • {beat.bpm} BPM • {beat.key}
          </p>
        </div>
        {previewMode && (
          <span style={{ fontSize: '0.75rem', backgroundColor: '#ffedd5', color: '#9a3412', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}>
            30s Preview
          </span>
        )}
        {!previewMode && !allowFullAccess && (
          <span style={{ fontSize: '0.75rem', backgroundColor: '#dbeafe', color: '#1e40af', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}>
            Full Access
          </span>
        )}
      </div>

      {/* Waveform Placeholder */}
      {showWaveform && (
        <div style={{ marginBottom: '1rem', height: '4rem', background: 'linear-gradient(to right, #dbeafe, #e0e7ff)', borderRadius: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '100%', height: '1rem', position: 'relative', backgroundColor: '#93c5fd', borderRadius: '0.25rem', opacity: 0.3 }}>
            <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: currentTime && maxTime ? ((currentTime / maxTime) * 100) + '%' : '0%', backgroundColor: '#3b82f6', borderRadius: '0.25rem' }}></div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={{ marginBottom: '0.75rem', padding: '0.5rem', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '0.25rem', color: '#b91c1c', fontSize: '0.875rem' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {/* Play/Pause & Time */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={togglePlay}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '2.5rem', height: '2.5rem', backgroundColor: '#2563eb', color: 'white', borderRadius: '9999px', border: 'none', cursor: 'pointer' }}
          >
            {isPlaying ? (
              <svg style={{ width: '1rem', height: '1rem' }} fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
              </svg>
            ) : (
              <svg style={{ width: '1rem', height: '1rem', marginLeft: '0.125rem' }} fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>

          <div style={{ flex: 1 }}>
            <input
              type="range"
              min="0"
              max={maxTime || 0}
              value={currentTime}
              onChange={handleSeek}
              style={{ width: '100%', height: '0.5rem', backgroundColor: '#e5e7eb', borderRadius: '0.5rem', appearance: 'none', cursor: 'pointer' }}
            />
          </div>

          <div style={{ fontSize: '0.875rem', color: '#6b7280', minWidth: 0 }}>
            {formatTime(currentTime)} / {formatTime(maxTime)}
          </div>
        </div>

        {/* Volume */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <svg style={{ width: '1rem', height: '1rem', color: '#9ca3af' }} fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            style={{ width: '5rem', height: '0.5rem', backgroundColor: '#e5e7eb', borderRadius: '0.5rem', appearance: 'none', cursor: 'pointer' }}
          />
        </div>
      </div>
    </div>
  )
}