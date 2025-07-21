import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'BeatsChain Blog | Web3 Music & Beat Production Insights',
  description: 'Latest insights on Web3 music, beat production, and the future of decentralized music ownership. Learn about BeatNFTs and blockchain music.',
  openGraph: {
    title: 'BeatsChain Blog',
    description: 'Latest insights on Web3 music, beat production, and the future of decentralized music ownership.',
    url: 'https://beatschain.app/blog',
    type: 'website',
    siteName: 'BeatsChain'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BeatsChain Blog',
    description: 'Latest insights on Web3 music, beat production, and the future of decentralized music ownership.'
  }
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}