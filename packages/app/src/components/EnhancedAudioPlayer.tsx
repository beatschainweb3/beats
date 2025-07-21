'use client'

import { useState, useRef, useEffect } from 'react'
import { Beat } from '@/types'
import { usePreviewAccess } from '@/hooks/usePreviewAccess'

interface EnhancedAudioPlayerProps {
  beat: Beat
  previewMode?: boolean
  showFullAccess?: boolean
  stems?: {
    drums?: string
    melody?: string
    bass?: string
    vocals?: string
  }
}

export default function EnhancedAudioPlayer({ 
  beat, 
  previewMode = true,
  showFullAccess = false,
  stems 
}: EnhancedAudioPlayerProps) {
  const { canAccessFullBeat, isConnected } = usePreviewAccess()
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [showStems, setShowStems] = useState(false)
  const [activeLayers, setActiveLayers] = useState({
    drums: true,
    melody: true,
    bass: true,
    vocals: true
  })

  const stemRefs = {
    drums: useRef<HTMLAudioElement>(null),
    melody: useRef<HTMLAudioElement>(null),
    bass: useRef<HTMLAudioElement>(null),
    vocals: useRef<HTMLAudioElement>(null)
  }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleEnded = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnded)

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
    }
  }, [previewMode])

  const togglePlay = async () => {
    const audio = audioRef.current
    if (!audio) return

    // Simple access control: connected wallets get full access
    if (!previewMode && !showFullAccess && !canAccessFullBeat) {
      alert('Connect your wallet for full beat access')
      return
    }

    try {
      if (isPlaying) {
        audio.pause()
        if (showStems) {
          Object.values(stemRefs).forEach(ref => {
            if (ref.current) ref.current.pause()
          })
        }
        setIsPlaying(false)
      } else {
        if (showStems && stems) {
          // Play stems
          const promises = Object.entries(stemRefs).map(([key, ref]) => {
            if (ref.current && activeLayers[key as keyof typeof activeLayers] && stems[key as keyof typeof stems]) {
              return ref.current.play()
            }
            return Promise.resolve()
          })
          await Promise.all(promises)
        } else {
          // Play main audio
          await audio.play()
        }
        setIsPlaying(true)
      }
    } catch (err) {
      console.error('Unable to play audio:', err)
      setIsPlaying(false)
    }
  }

  const toggleLayer = (layer: keyof typeof activeLayers) => {
    const newLayers = { ...activeLayers, [layer]: !activeLayers[layer] }
    setActiveLayers(newLayers)
    
    const stemRef = stemRefs[layer]
    if (stemRef.current) {
      if (newLayers[layer] && isPlaying) {
        stemRef.current.play()
      } else {
        stemRef.current.pause()
      }
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const maxTime = (previewMode || (!isConnected && !showFullAccess)) ? Math.min(duration, 30) : duration

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      {/* Main Audio */}
      <audio
        ref={audioRef}
        src={beat.audioUrl}
        preload="metadata"
      />

      {/* Stem Audio Elements */}
      {stems && Object.entries(stems).map(([key, url]) => (
        <audio
          key={key}
          ref={stemRefs[key as keyof typeof stemRefs]}
          src={url}
          preload="metadata"
        />
      ))}

      {/* Beat Info */}
      <div className="flex items-center gap-3 mb-4">
        {beat.coverImageUrl && (
          <img
            src={beat.coverImageUrl}
            alt={beat.title}
            className="w-12 h-12 rounded object-cover"
          />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{beat.title}</h3>
          {beat.stageName && (
            <p className="text-sm text-green-600 font-medium">by {beat.stageName}</p>
          )}
          <p className="text-sm text-gray-500">
            {beat.genre} • {beat.bpm} BPM • {beat.key}
          </p>
        </div>
        <div className="flex gap-2">
          {previewMode && (
            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
              30s Preview
            </span>
          )}
          {stems && (
            <button
              onClick={() => setShowStems(!showStems)}
              className={`text-xs px-2 py-1 rounded ${
                showStems 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {showStems ? 'Hide Stems' : 'Show Stems'}
            </button>
          )}
          {showFullAccess && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              Full Access
            </span>
          )}
        </div>
      </div>

      {/* Stem Controls */}
      {showStems && stems && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Stem Layers</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(activeLayers).map(([layer, active]) => (
              stems[layer as keyof typeof stems] && (
                <button
                  key={layer}
                  onClick={() => toggleLayer(layer as keyof typeof activeLayers)}
                  className={`p-2 rounded text-sm font-medium transition-colors ${
                    active 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {layer.charAt(0).toUpperCase() + layer.slice(1)}
                </button>
              )
            ))}
          </div>
        </div>
      )}

      {/* Playback Controls */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
          >
            {isPlaying ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
              </svg>
            ) : (
              <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>

          <div className="flex-1">
            <input
              type="range"
              min="0"
              max={maxTime || 0}
              value={currentTime}
              onChange={(e) => {
                const newTime = parseFloat(e.target.value)
                if (audioRef.current) {
                  audioRef.current.currentTime = newTime
                }
                if (showStems) {
                  Object.values(stemRefs).forEach(ref => {
                    if (ref.current) {
                      ref.current.currentTime = newTime
                    }
                  })
                }
                setCurrentTime(newTime)
              }}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="text-sm text-gray-500 min-w-0">
            {formatTime(currentTime)} / {formatTime(maxTime)}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => {
              const newVolume = parseFloat(e.target.value)
              setVolume(newVolume)
              if (audioRef.current) {
                audioRef.current.volume = newVolume
              }
              if (showStems) {
                Object.values(stemRefs).forEach(ref => {
                  if (ref.current) {
                    ref.current.volume = newVolume
                  }
                })
              }
            }}
            className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  )
}