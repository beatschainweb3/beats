import { Metadata } from 'next'
import { client, urlFor } from '@/lib/sanity'

interface PageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  if (!client) {
    return {
      title: 'BeatsChain Blog',
      description: 'Latest insights on Web3 music and beat production'
    }
  }
  
  try {
    const post = await client.fetch(`*[_type == "post" && slug.current == $slug][0] {
      title, excerpt, mainImage, author->{ name }
    }`, { slug: params.slug })
    
    if (!post) {
      return {
        title: params.slug === 'what-is-a-beatnft' ? 'What is a BeatNFT? | BeatsChain' : 'BeatsChain Blog',
        description: params.slug === 'what-is-a-beatnft' 
          ? 'BeatNFTs are revolutionary digital assets that represent ownership of unique musical beats on the blockchain.'
          : 'Latest insights on Web3 music and beat production'
      }
    }
    
    const description = post.excerpt || 'Read this article on BeatsChain'
    const imageUrl = post.mainImage?.asset ? urlFor(post.mainImage).width(1200).height(630).url() : null
    
    return {
      title: `${post.title} | BeatsChain Blog`,
      description,
      openGraph: {
        title: post.title,
        description,
        url: `https://beatschain.app/blog/${params.slug}`,
        type: 'article',
        images: imageUrl ? [{
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.title
        }] : [],
        siteName: 'BeatsChain'
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description,
        images: imageUrl ? [imageUrl] : []
      }
    }
  } catch {
    return {
      title: 'BeatsChain Blog',
      description: 'Latest insights on Web3 music and beat production'
    }
  }
}

export default function BlogPostLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}