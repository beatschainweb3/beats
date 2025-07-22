'use client'

import { useState } from 'react'
import { useCardStyles } from '@/hooks/useCardStyles'
import OptimizedImage from './OptimizedImage'
import { normalizeImageSource } from '@/utils/imageOptimization'

interface Producer {
  id: string
  name: string
  location?: string
  genre?: string
  totalBeats?: number
  totalSales?: number
  rating?: number
  verified?: boolean
  profileImage?: string
}

interface ProducerCardProps {
  producer: Producer
}

export default function ProducerCard({ producer }: ProducerCardProps) {
  const { producerCardStyle, getShadowClass } = useCardStyles()
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <div 
      style={{
        background: producerCardStyle.cardBackground,
        borderRadius: producerCardStyle.borderRadius,
        boxShadow: isHovered ? 'rgba(0, 0, 0, 0.15) 0px 4px 12px' : getShadowClass(producerCardStyle.shadowSize),
        border: `1px solid ${producerCardStyle.borderColor}`,
        padding: '1.5rem',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)'
      }}
      onMouseOver={() => setIsHovered(true)}
      onMouseOut={() => setIsHovered(false)}
    >
      {/* Producer Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{
          width: producerCardStyle.profileImageSize,
          height: producerCardStyle.profileImageSize,
          borderRadius: '50%',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          position: 'relative'
        }}>
          {producer.profileImage ? (
            <OptimizedImage 
              src={normalizeImageSource(producer.profileImage)} 
              alt={`${producer.name}'s profile`}
              fill
              sizes="96px"
              className="object-cover"
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              background: producerCardStyle.defaultCoverGradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {producer.name.charAt(0)}
            </div>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', margin: 0 }}>
              {producer.name}
            </h3>
            {producer.verified && (
              <span style={{ color: producerCardStyle.verifiedBadgeColor, fontSize: '1rem' }}>✓</span>
            )}
          </div>
          {producer.location && (
            <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>
              {producer.location}
            </p>
          )}
        </div>
      </div>

      {/* Producer Stats */}
      <div style={{ marginBottom: '1rem' }}>
        {producer.genre && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Genres:</span>
            <span style={{ color: '#1f2937', fontSize: '0.875rem', fontWeight: '500' }}>
              {producer.genre}
            </span>
          </div>
        )}
        {producer.totalBeats !== undefined && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Total Beats:</span>
            <span style={{ color: '#1f2937', fontSize: '0.875rem', fontWeight: '500' }}>
              {producer.totalBeats}
            </span>
          </div>
        )}
        {producer.totalSales !== undefined && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Total Sales:</span>
            <span style={{ color: '#059669', fontSize: '0.875rem', fontWeight: '500' }}>
              {producer.totalSales}
            </span>
          </div>
        )}
      </div>

      {/* Rating */}
      {producer.rating && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {[...Array(5)].map((_, i) => (
              <span key={i} style={{ 
                color: i < Math.floor(producer.rating || 0) ? '#fbbf24' : '#d1d5db',
                fontSize: '0.875rem'
              }}>
                ★
              </span>
            ))}
            <span style={{ color: '#6b7280', fontSize: '0.875rem', marginLeft: '0.5rem' }}>
              {producer.rating}
            </span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <a href={`/producer/${producer.id}`} style={{
          flex: 1,
          background: producerCardStyle.accentColor,
          color: 'white',
          padding: '0.75rem',
          border: 'none',
          borderRadius: '0.375rem',
          fontWeight: '500',
          cursor: 'pointer',
          fontSize: '0.875rem',
          textDecoration: 'none',
          textAlign: 'center',
          display: 'block'
        }}>
          View Beats
        </a>
        <button style={{
          padding: '0.75rem',
          background: 'white',
          border: '1px solid #d1d5db',
          borderRadius: '0.375rem',
          cursor: 'pointer',
          fontSize: '0.875rem'
        }}>
          Follow
        </button>
      </div>
    </div>
  )
}