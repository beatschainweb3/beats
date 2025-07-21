import { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  // In production, fetch beat data from API
  const beatTitle = 'Beat Title'
  const producerName = 'Producer Name'
  const description = `Listen to "${beatTitle}" by ${producerName} on BeatsChain - Web3 Beat Marketplace`
  
  return {
    title: `${beatTitle} by ${producerName} | BeatsChain`,
    description,
    openGraph: {
      title: `${beatTitle} by ${producerName}`,
      description,
      type: 'music.song',
      url: `https://beatschain.com/beat/${params.id}`,
      siteName: 'BeatsChain',
      images: [
        {
          url: `/beat/${params.id}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${beatTitle} by ${producerName}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${beatTitle} by ${producerName}`,
      description,
      images: [`/beat/${params.id}/opengraph-image`],
    },
  }
}

export default function BeatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}