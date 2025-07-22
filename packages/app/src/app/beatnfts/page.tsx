'use client'

import { useState, useEffect } from 'react'
import { Beat } from '@/types/data'
import SanityBeatCard from '@/components/SanityBeatCard'
import { useDebounce } from '@/hooks/useDebounce'
import { Pagination } from '@/components/Pagination'
import { client } from '@/lib/sanity-client'
import CmsHeroSection from '@/components/HeroSection'
import { dataProvider } from '@/adapters/unifiedDataProvider'

export default function MarketplacePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const [heroData, setHeroData] = useState(null)
  const beatsPerPage = 8
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const [beats, setBeats] = useState<Beat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load beats and hero data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError(null)
        
        // Get featured beats from unified provider
        try {
          const fetchedBeats = await dataProvider.getFeaturedBeats()
          console.log('Fetched beats:', fetchedBeats.length)
          setBeats(fetchedBeats)
        } catch (beatsError) {
          console.error('Error fetching beats:', beatsError)
          setBeats([])
        }
        
        // Load hero data from Sanity
        if (client) {
          try {
            const data = await client.fetch(`*[_type == "page" && slug.current == "beatnfts"][0].heroSection`)
            if (data) setHeroData(data)
          } catch (heroError) {
            console.warn('Failed to fetch hero data from Sanity:', heroError)
          }
        }
      } catch (err) {
        console.error('Failed to load data:', err)
        setError('Failed to load beats')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchTerm, selectedGenre, sortBy])
  
  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎫</div>
          <p className="text-gray-600">Loading BeatNFTs...</p>
        </div>
      </div>
    )
  }

  const filteredBeats = beats.filter(beat => {
    const matchesSearch = beat.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                         beat.genre.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    const matchesGenre = selectedGenre === 'all' || beat.genre.toLowerCase() === selectedGenre.toLowerCase()
    return matchesSearch && matchesGenre
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredBeats.length / beatsPerPage)
  const startIndex = (currentPage - 1) * beatsPerPage
  const currentBeats = filteredBeats.slice(startIndex, startIndex + beatsPerPage)

  return (
    <div>
      {/* Hero Section - CMS or Fallback */}
      {heroData ? (
        <CmsHeroSection data={heroData} />
      ) : (
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          color: 'white',
          position: 'relative'
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }}></div>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem', position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <h1 style={{ fontSize: '3.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
              🎫 BeatNFTs Marketplace
            </h1>
            <p style={{ fontSize: '1.25rem', marginBottom: '2rem', opacity: 0.9 }}>
              Discover and own premium beats as NFTs from talented South African producers
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.75rem 1.5rem', borderRadius: '2rem', border: '1px solid rgba(255,255,255,0.3)' }}>
                🔥 Hot Amapiano Beats
              </div>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.75rem 1.5rem', borderRadius: '2rem', border: '1px solid rgba(255,255,255,0.3)' }}>
                🎶 Afrobeats Collection
              </div>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.75rem 1.5rem', borderRadius: '2rem', border: '1px solid rgba(255,255,255,0.3)' }}>
                💎 Exclusive Drops
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search BeatNFTs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Genres</option>
            <option value="amapiano">Amapiano</option>
            <option value="afrobeats">Afrobeats</option>
            <option value="hip hop">Hip Hop</option>
            <option value="trap">Trap</option>
            <option value="house">House</option>
            <option value="electronic">Electronic</option>
            <option value="drill">Drill</option>
            <option value="gqom">Gqom</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6 flex justify-between items-center">
        <p className="text-gray-600">
          Showing {filteredBeats.length > 0 ? `${startIndex + 1}-${Math.min(startIndex + beatsPerPage, filteredBeats.length)} of ` : ''}{filteredBeats.length} BeatNFT{filteredBeats.length !== 1 ? 's' : ''}
        </p>
        <p className="text-sm text-gray-500">
          {totalPages > 0 ? `Page ${currentPage} of ${totalPages}` : ''}
        </p>
      </div>

      {/* Beats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {currentBeats.map(beat => (
          <SanityBeatCard key={beat.id} beat={beat} />
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalItems={filteredBeats.length}
          itemsPerPage={beatsPerPage}
          onPageChange={setCurrentPage}
        />
      )}

      {currentBeats.length === 0 && (
        <div className="text-center py-16">
          <div className="text-8xl mb-6">🎫</div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">No BeatNFTs found</h3>
          <p className="text-gray-600 mb-6">Try adjusting your search terms or filters to discover more BeatNFTs</p>
          <div className="flex flex-wrap justify-center gap-2">
            {['amapiano', 'afrobeats', 'trap', 'hip hop'].map(genre => (
              <button
                key={genre}
                onClick={() => {
                  setSelectedGenre(genre)
                  setSearchTerm('')
                }}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors text-sm font-medium"
              >
                Try {genre}
              </button>
            ))}
          </div>
        </div>
      )}

      </div>
    </div>
  )
}