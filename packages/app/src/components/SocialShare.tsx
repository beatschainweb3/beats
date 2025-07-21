'use client'

import { useState, useEffect } from 'react'

interface SocialShareProps {
  url?: string
  title?: string
  description?: string
  hashtags?: string[]
  size?: 'sm' | 'md' | 'lg'
  showLabels?: boolean
}

export default function SocialShare({ 
  url, 
  title = 'Check this out on BeatsChain', 
  description = 'Web3 Beat Marketplace',
  hashtags = ['BeatsChain', 'Web3Beats', 'BeatNFT'],
  size = 'md',
  showLabels = false
}: SocialShareProps) {
  const [shareUrl, setShareUrl] = useState(url || '')
  
  // Set the URL on the client side
  useEffect(() => {
    if (!url && typeof window !== 'undefined') {
      setShareUrl(window.location.href)
    }
  }, [url])
  const shareText = `${title} - ${description}`
  const hashtagString = hashtags.map(tag => `#${tag}`).join(' ')
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-2', 
    lg: 'text-base px-4 py-3'
  }
  
  const iconSizes = {
    sm: '1rem',
    md: '1.25rem',
    lg: '1.5rem'
  }

  const shareLinks = [
    {
      name: 'Twitter',
      icon: '🐦',
      color: '#1da1f2',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}&hashtags=${encodeURIComponent(hashtags.join(','))}`
    },
    {
      name: 'Facebook', 
      icon: '📘',
      color: '#4267b2',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`
    },
    {
      name: 'LinkedIn',
      icon: '💼', 
      color: '#0077b5',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(description)}`
    },
    {
      name: 'WhatsApp',
      icon: '💬',
      color: '#25d366', 
      url: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`
    },
    {
      name: 'Telegram',
      icon: '✈️',
      color: '#0088cc',
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`
    }
  ]

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      // Could add toast notification here
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
      {shareLinks.map(link => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: link.color,
            color: 'white',
            borderRadius: '0.375rem',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: '500',
            transition: 'all 0.2s',
            ...sizeClasses[size]
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.9'
            e.currentTarget.style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          <span style={{ fontSize: iconSizes[size] }}>{link.icon}</span>
          {showLabels && <span>{link.name}</span>}
        </a>
      ))}
      
      <button
        onClick={copyToClipboard}
        style={{
          background: '#6b7280',
          color: 'white',
          border: 'none',
          borderRadius: '0.375rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: '500',
          transition: 'all 0.2s',
          ...sizeClasses[size]
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '0.9'
          e.currentTarget.style.transform = 'translateY(-1px)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '1'
          e.currentTarget.style.transform = 'translateY(0)'
        }}
      >
        <span style={{ fontSize: iconSizes[size] }}>🔗</span>
        {showLabels && <span>Copy</span>}
      </button>
    </div>
  )
}