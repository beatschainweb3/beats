import { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  // In production, fetch producer data from API
  const producerName = 'Producer Name'
  const description = `Discover beats by ${producerName} on BeatsChain - Web3 Beat Marketplace`
  
  return {
    title: `${producerName} | BeatsChain Producer`,
    description,
    openGraph: {
      title: `${producerName} - SA Beat Producer`,
      description,
      type: 'profile',
      url: `https://beatschain.com/producer/${params.id}`,
      siteName: 'BeatsChain',
      images: [
        {
          url: `/producer/${params.id}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${producerName} - Beat Producer`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${producerName} - SA Beat Producer`,
      description,
      images: [`/producer/${params.id}/opengraph-image`],
    },
  }
}

export default function ProducerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}