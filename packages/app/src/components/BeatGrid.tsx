'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import AudioPlayer from './audio/AudioPlayer'

interface Beat {
  id: string
  title: string
  genre?: string
  bpm?: number
  key?: string
  price: number
  coverImageUrl?: string
  audioUrl?: string
  stageName?: string
  featured?: boolean
}

interface BeatGridProps {
  beats: Beat[]
  loading: boolean
  title?: string
  showFilters?: boolean
  showFeatured?: boolean
}

export default function BeatGrid({ 
  beats, 
  loading, 
  title = 'Beats', 
  showFilters = true,
  showFeatured = true
}: BeatGridProps) {
  const [filteredBeats, setFilteredBeats] = useState<Beat[]>([])
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const beatsPerPage = 9
  
  // Extract all unique genres
  const allGenres = Array.from(
    new Set(
      beats.map(beat => beat.genre?.toLowerCase() || 'unknown')
    )
  )
  
  // Filter beats based on active filter
  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredBeats(beats)
    } else if (activeFilter === 'featured') {
      setFilteredBeats(beats.filter(beat => beat.featured))
    } else {
      setFilteredBeats(
        beats.filter(beat => 
          beat.genre?.toLowerCase() === activeFilter
        )
      )
    }
    setCurrentPage(1)
  }, [activeFilter, beats])
  
  // Pagination
  const totalPages = Math.ceil(filteredBeats.length / beatsPerPage)
  const startIndex = (currentPage - 1) * beatsPerPage
  const currentBeats = filteredBeats.slice(startIndex, startIndex + beatsPerPage)
  
  // Featured beats (first 3)
  const featuredBeats = showFeatured ? beats.filter(beat => beat.featured).slice(0, 3) : []
  
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading beats...</p>
      </div>
    )
  }
  
  if (beats.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <div className="text-5xl mb-4">🎵</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">No Beats Available</h2>
        <p className="text-gray-600">
          Check back soon for the latest beats!
        </p>
      </div>
    )
  }
  
  return (
    <div className="space-y-10">
      {/* Featured Beats Section */}
      {featuredBeats.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Featured Beats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredBeats.map((beat) => (
              <motion.div 
                key={beat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl overflow-hidden shadow-md border border-indigo-100"
              >
                <div className="h-48 overflow-hidden">
                  <div 
                    className="w-full h-full bg-cover bg-center"
                    style={{ 
                      backgroundImage: beat.coverImageUrl ? `url(${beat.coverImageUrl})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    }}
                  >
                    {!beat.coverImageUrl && (
                      <div className="w-full h-full flex items-center justify-center text-white text-4xl">
                        🎵
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex gap-2 mb-3">
                    <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      Featured
                    </span>
                    {beat.genre && (
                      <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {beat.genre}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2 text-gray-900">
                    <Link href={`/beat/${beat.id}`} className="hover:text-indigo-700 transition-colors">
                      {beat.title}
                    </Link>
                  </h3>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-lg font-bold text-green-600">
                        {beat.price.toFixed(3)} ETH
                      </div>
                      <div className="text-xs text-gray-500">
                        ~R{Math.round(beat.price * 18000).toLocaleString()}
                      </div>
                    </div>
                    
                    <Link
                      href={`/beatnfts?beat=${beat.id}`}
                      className="bg-green-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      Buy Now
                    </Link>
                  </div>
                  
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
              </motion.div>
            ))}
          </div>
        </section>
      )}
      
      {/* Filters */}
      {showFilters && (
        <section>
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeFilter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              All Beats
            </button>
            
            {showFeatured && (
              <button
                onClick={() => setActiveFilter('featured')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeFilter === 'featured'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                Featured
              </button>
            )}
            
            {allGenres.map(genre => (
              <button
                key={genre}
                onClick={() => setActiveFilter(genre)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeFilter === genre
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {genre.charAt(0).toUpperCase() + genre.slice(1)}
              </button>
            ))}
          </div>
        </section>
      )}
      
      {/* Main Grid */}
      <section>
        {title && (
          <h2 className="text-2xl font-bold mb-6 text-gray-900">{title}</h2>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentBeats.map((beat, index) => (
            <motion.div 
              key={beat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="h-48 overflow-hidden">
                <div 
                  className="w-full h-full bg-cover bg-center"
                  style={{ 
                    backgroundImage: beat.coverImageUrl ? `url(${beat.coverImageUrl})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  }}
                >
                  {!beat.coverImageUrl && (
                    <div className="w-full h-full flex items-center justify-center text-white text-4xl">
                      🎵
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex flex-wrap gap-2 mb-3">
                  {beat.genre && (
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {beat.genre}
                    </span>
                  )}
                  {beat.featured && (
                    <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      Featured
                    </span>
                  )}
                </div>
                
                <h3 className="text-lg font-bold mb-2 text-gray-900">
                  <Link href={`/beat/${beat.id}`} className="hover:text-blue-700 transition-colors">
                    {beat.title}
                  </Link>
                </h3>
                
                <div className="text-sm text-gray-600 mb-3">
                  {beat.stageName && <span className="font-medium">by {beat.stageName}</span>}
                  {beat.bpm && beat.key && (
                    <span className="block mt-1">
                      {beat.bpm} BPM • {beat.key}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-lg font-bold text-green-600">
                      {beat.price.toFixed(3)} ETH
                    </div>
                    <div className="text-xs text-gray-500">
                      ~R{Math.round(beat.price * 18000).toLocaleString()}
                    </div>
                  </div>
                  
                  <Link
                    href={`/beatnfts?beat=${beat.id}`}
                    className="bg-green-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    Buy Now
                  </Link>
                </div>
                
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
            </motion.div>
          ))}
        </div>
      </section>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-10">
          <nav className="inline-flex rounded-md shadow">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="hidden md:flex">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === page
                      ? 'bg-indigo-50 text-indigo-600 z-10'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <div className="md:hidden flex items-center px-4 border-t border-b border-gray-300 bg-white">
              <span className="text-sm text-gray-700">
                {currentPage} / {totalPages}
              </span>
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  )
}