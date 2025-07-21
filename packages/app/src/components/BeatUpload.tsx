'use client'

import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useFileUpload } from '@/hooks/useFileUpload'
import { useWeb3Beats } from '@/hooks/useWeb3Beats'
import { useWeb3Auth } from '@/hooks/useWeb3Auth'
import { useBeatNFT } from '@/hooks/useBeatNFT'
import BuyBeatNFTModal from '@/components/BuyBeatNFTModal'
import LicenseSelector from '@/components/LicenseSelector'
import ProtectedRoute from '@/components/ProtectedRoute'
import { toast } from 'react-toastify'

export default function BeatUpload() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: 'hip-hop',
    bpm: 120,
    key: 'C',
    price: 0.05,
    tags: '',
    stageName: ''
  })
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [selectedLicense, setSelectedLicense] = useState('BASIC')
  const [submitting, setSubmitting] = useState(false)
  const [showBuyModal, setShowBuyModal] = useState(false)

  const { user, isAuthenticated } = useWeb3Auth()
  const { uploadBeatAudio, uploadCoverImage, uploading, progress, error } = useFileUpload()
  const { refreshBeats } = useWeb3Beats()
  const { balance, canUpload, useCredits, isConnected } = useBeatNFT()

  const { getRootProps: getAudioProps, getInputProps: getAudioInputProps } = useDropzone({
    accept: { 'audio/*': ['.mp3', '.wav', '.m4a'] },
    maxFiles: 1,
    onDrop: (files) => setAudioFile(files[0])
  })

  const { getRootProps: getCoverProps, getInputProps: getCoverInputProps } = useDropzone({
    accept: { 'image/*': ['.jpg', '.jpeg', '.png'] },
    maxFiles: 1,
    onDrop: (files) => setCoverFile(files[0])
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!isAuthenticated || !user) {
      toast.error('Please connect your wallet and sign in to upload beats')
      return
    }
    
    if (!audioFile) {
      toast.error('Please select an audio file')
      return
    }
    
    if (!formData.title.trim()) {
      toast.error('Please enter a title for your beat')
      return
    }
    
    if (formData.price <= 0) {
      toast.error('Please enter a valid price')
      return
    }

    // Check BeatNFT credits
    const fileType = audioFile.name.split('.').pop()?.toLowerCase() || 'mp3'
    const uploadCheck = canUpload(fileType)
    
    if (!uploadCheck.allowed) {
      toast.error(uploadCheck.reason || 'Insufficient credits')
      setShowBuyModal(true)
      return
    }

    setSubmitting(true)

    try {
      const beatId = Date.now().toString()
      
      // Upload audio file
      const audioUrl = await uploadBeatAudio(audioFile, beatId)
      
      // Upload cover image if provided
      let coverImageUrl = 'https://via.placeholder.com/300x300/1a1a1a/ffffff?text=' + encodeURIComponent(formData.title)
      if (coverFile) {
        coverImageUrl = await uploadCoverImage(coverFile, beatId)
      }

      // Create NFT metadata
      const metadata = {
        name: formData.title,
        description: formData.description,
        image: coverImageUrl,
        audio: audioUrl,
        attributes: [
          { trait_type: 'Genre', value: formData.genre },
          { trait_type: 'BPM', value: formData.bpm },
          { trait_type: 'Key', value: formData.key },
          { trait_type: 'Producer', value: user.address },
          { trait_type: 'Stage Name', value: formData.stageName || 'Unknown Artist' },
          { trait_type: 'Price', value: formData.price },
          ...formData.tags.split(',').map(tag => ({ trait_type: 'Tag', value: tag.trim() }))
        ]
      }

      // Store beat data in user's profile (temporary until smart contract integration)
      const beatData = {
        id: beatId,
        title: formData.title,
        description: formData.description,
        genre: formData.genre,
        bpm: formData.bpm,
        key: formData.key,
        tags: formData.tags.split(',').map(t => t.trim()),
        price: formData.price,
        audioUrl,
        coverImageUrl,
        producerId: user.address,
        stageName: formData.stageName || 'Unknown Artist',
        licenseType: selectedLicense,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'active',
        plays: 0,
        likes: 0,
        royaltyPercentage: 5,
        isActive: true
      }
      
      // Store in producer's beats list
      const producerBeatsKey = `producer_beats_${user.address}`
      const existingBeats = JSON.parse(localStorage.getItem(producerBeatsKey) || '[]')
      existingBeats.unshift(beatData)
      localStorage.setItem(producerBeatsKey, JSON.stringify(existingBeats))
      
      console.log('Beat uploaded:', beatData)
      
      // Use BeatNFT credits
      const fileType = audioFile.name.split('.').pop()?.toLowerCase() || 'mp3'
      const uploadCheck = canUpload(fileType)
      if (uploadCheck.cost > 0) {
        await useCredits(uploadCheck.cost)
        toast.success(`✅ Used ${uploadCheck.cost} BeatNFT credit${uploadCheck.cost > 1 ? 's' : ''}!`)
      }
      
      // Refresh beats list
      await refreshBeats()

      // Reset form
      setFormData({
        title: '',
        description: '',
        genre: 'hip-hop',
        bpm: 120,
        key: 'C',
        price: 0.05,
        tags: '',
        stageName: ''
      })
      setAudioFile(null)
      setCoverFile(null)
      setSelectedLicense('BASIC')

      toast.success('🎵 Beat uploaded successfully! Your beat is now live on the marketplace.')
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 2000)
    } catch (err: any) {
      console.error('Upload failed:', err)
      toast.error(`Upload failed: ${err.message || 'Please try again'}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        minHeight: '40vh',
        display: 'flex',
        alignItems: 'center',
        color: 'white',
        position: 'relative'
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)' }}></div>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem', position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            🎵 Upload Your Beat
          </h1>
          <p style={{ fontSize: '1.125rem', opacity: 0.9 }}>
            Share your music with the world and start earning from your creativity
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
        
        {/* BeatNFT Credits Display */}
        {isConnected && (
          <div style={{
            background: balance.hasProNFT ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : '#f0f9ff',
            border: balance.hasProNFT ? 'none' : '1px solid #bfdbfe',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '2rem',
            color: balance.hasProNFT ? 'white' : '#1e40af'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                  {balance.hasProNFT ? '♾️ Pro BeatNFT - Unlimited Uploads' : `🎫 ${balance.credits} BeatNFT Credits`}
                </h3>
                <p style={{ fontSize: '0.875rem', opacity: 0.8, margin: 0 }}>
                  {balance.hasProNFT ? 'Upload any format, any size' : 'MP3: 1 credit • WAV: 2 credits • ZIP: 3-5 credits'}
                </p>
              </div>
              {!balance.hasProNFT && balance.credits < 3 && (
                <button
                  onClick={() => setShowBuyModal(true)}
                  style={{
                    background: '#3b82f6',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    cursor: 'pointer'
                  }}
                >
                  Buy More
                </button>
              )}
            </div>
          </div>
        )}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
        {/* Audio Upload */}
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
            Audio File *
          </label>
          <div
            {...getAudioProps()}
            style={{
              border: '2px dashed #d1d5db',
              borderRadius: '0.5rem',
              padding: '2rem',
              textAlign: 'center',
              cursor: 'pointer',
              background: audioFile ? '#f0fdf4' : '#f9fafb'
            }}
          >
            <input {...getAudioInputProps()} />
            {audioFile ? (
              <p style={{ color: '#059669', margin: 0 }}>✓ {audioFile.name}</p>
            ) : (
              <p style={{ color: '#6b7280', margin: 0 }}>Drop audio file here or click to browse</p>
            )}
          </div>
        </div>

        {/* Cover Image Upload */}
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
            Cover Image
          </label>
          <div
            {...getCoverProps()}
            style={{
              border: '2px dashed #d1d5db',
              borderRadius: '0.5rem',
              padding: '2rem',
              textAlign: 'center',
              cursor: 'pointer',
              background: coverFile ? '#f0fdf4' : '#f9fafb'
            }}
          >
            <input {...getCoverInputProps()} />
            {coverFile ? (
              <p style={{ color: '#059669', margin: 0 }}>✓ {coverFile.name}</p>
            ) : (
              <p style={{ color: '#6b7280', margin: 0 }}>Drop cover image here or click to browse</p>
            )}
          </div>
        </div>

        {/* Beat Details */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
              Stage Name
            </label>
            <input
              type="text"
              value={formData.stageName}
              onChange={(e) => setFormData({ ...formData, stageName: e.target.value })}
              placeholder="Your artist/producer name"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem'
              }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
            Price (ETH)
          </label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
            step="0.001"
            min="0.001"
            max="10"
            placeholder="0.050"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem'
            }}
          />
          <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
            ~R{Math.round(formData.price * 18000).toLocaleString()} ZAR
          </p>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              resize: 'vertical'
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
              Genre
            </label>
            <select
              value={formData.genre}
              onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem'
              }}
            >
              <option value="hip-hop">Hip Hop</option>
              <option value="trap">Trap</option>
              <option value="electronic">Electronic</option>
              <option value="r&b">R&B</option>
              <option value="pop">Pop</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
              BPM
            </label>
            <input
              type="number"
              value={formData.bpm}
              onChange={(e) => setFormData({ ...formData, bpm: parseInt(e.target.value) })}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
              Key
            </label>
            <input
              type="text"
              value={formData.key}
              onChange={(e) => setFormData({ ...formData, key: e.target.value })}
              placeholder="C, Am, F#"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem'
              }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
            Tags (comma separated)
          </label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder="dark, trap, hard, melodic"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem'
            }}
          />
        </div>
        
        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
          <LicenseSelector
            selectedLicense={selectedLicense}
            onLicenseChange={setSelectedLicense}
            fileType={audioFile?.name.split('.').pop()?.toLowerCase()}
          />
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div style={{ background: '#f0f9ff', padding: '1rem', borderRadius: '0.375rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', color: '#1e40af' }}>Uploading...</span>
              <span style={{ fontSize: '0.875rem', color: '#1e40af' }}>{Math.round(progress)}%</span>
            </div>
            <div style={{ background: '#e0e7ff', height: '0.5rem', borderRadius: '0.25rem' }}>
              <div
                style={{
                  background: '#3b82f6',
                  height: '100%',
                  borderRadius: '0.25rem',
                  width: `${progress}%`,
                  transition: 'width 0.3s'
                }}
              />
            </div>
          </div>
        )}

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '1rem', borderRadius: '0.375rem' }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!audioFile || submitting || uploading}
          style={{
            background: (!audioFile || submitting || uploading) ? '#9ca3af' : '#3b82f6',
            color: 'white',
            padding: '1rem 2rem',
            border: 'none',
            borderRadius: '0.375rem',
            fontWeight: '600',
            cursor: (!audioFile || submitting || uploading) ? 'not-allowed' : 'pointer'
          }}
        >
          {submitting ? 'Uploading Beat...' : 'Upload Beat'}
        </button>
      </form>
      
      <BuyBeatNFTModal 
        isOpen={showBuyModal}
        onClose={() => setShowBuyModal(false)}
        requiredCredits={audioFile ? canUpload(audioFile.name.split('.').pop()?.toLowerCase() || 'mp3').cost : 1}
      />
      
      </div>
    </div>
  )
}