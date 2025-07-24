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
  
  // Define Tailwind classes for different sizes
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-2', 
    lg: 'text-base px-4 py-3'
  }
  
  const iconClasses = {
    sm: 'text-base',
    md: 'text-lg', 
    lg: 'text-xl'
  }

  const shareLinks = [
    {
      name: 'Twitter',
      icon: 'X',
      color: '#000000',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}&hashtags=${encodeURIComponent(hashtags.join(','))}`
    },
    {
      name: 'Facebook', 
      icon: 'f',
      color: '#1877f2',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`
    },
    {
      name: 'LinkedIn',
      icon: 'in', 
      color: '#0a66c2',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(description)}`
    },
    {
      name: 'Instagram',
      icon: 'IG',
      color: '#e4405f', 
      url: `https://www.instagram.com/`
    },
    {
      name: 'SoundCloud',
      icon: 'SC',
      color: '#ff5500',
      url: `https://soundcloud.com/`
    },
    {
      name: 'YouTube',
      icon: 'YT',
      color: '#ff0000',
      url: `https://youtube.com/`
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
    <div className="flex gap-2 flex-wrap items-center">
      {shareLinks.map(link => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`rounded no-underline flex items-center gap-2 font-medium transition-all hover:opacity-90 hover:-translate-y-0.5 text-white ${sizeClasses[size]}`}
          style={{ backgroundColor: link.color }}
        >
          <span className={iconClasses[size]}>{link.icon}</span>
          {showLabels && <span>{link.name}</span>}
        </a>
      ))}
      
      <button
        onClick={copyToClipboard}
        className={`bg-gray-500 text-white border-none rounded cursor-pointer flex items-center gap-2 font-medium transition-all hover:opacity-90 hover:-translate-y-0.5 ${sizeClasses[size]}`}
      >
        <span className={iconClasses[size]}>Link</span>
        {showLabels && <span>Copy</span>}
      </button>
    </div>
  )
}