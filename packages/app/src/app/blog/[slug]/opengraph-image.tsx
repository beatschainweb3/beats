import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'BeatsChain Blog - Web3 Beat Industry Insights'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: { slug: string } }) {
  // Try to fetch the actual blog post title from Sanity
  let title = 'BeatsChain Blog'
  let description = 'Web3 Beat Industry Insights'
  
  try {
    const { client } = await import('@/lib/sanity-client')
    const post = await client.fetch(`
      *[_type == "post" && slug.current == $slug][0] {
        title,
        excerpt
      }
    `, { slug: params.slug })
    
    if (post?.title) {
      title = post.title
      if (post.excerpt) {
        description = post.excerpt
      }
    }
  } catch (error) {
    // Fallback to default or slug-based title
    if (params.slug === 'what-is-a-beatnft') {
      title = 'What is a BeatNFT?'
      description = 'Learn about BeatNFTs and how they work on BeatsChain'
    }
  }
  
  return new ImageResponse(
    (
      <div
        tw='flex flex-col items-center justify-center w-full h-full text-white relative'
        style={{
          background: 'linear-gradient(135deg, #1f2937 0%, #374151 50%, #4b5563 100%)',
        }}>
        
        {/* Background Pattern */}
        <div tw='absolute inset-0 opacity-10'>
          <div tw='flex flex-wrap gap-12 p-8'>
            <div tw='text-8xl'>📝</div>
            <div tw='text-8xl'>🎵</div>
            <div tw='text-8xl'>⛓️</div>
            <div tw='text-8xl'>🎫</div>
            <div tw='text-8xl'>💡</div>
            <div tw='text-8xl'>🚀</div>
          </div>
        </div>
        
        <div tw='flex flex-col items-center justify-center z-10'>
          <h1 tw='text-6xl font-bold mb-6 text-center'>{title}</h1>
          <h2 tw='text-3xl mb-8 text-center'>BeatsChain Blog</h2>
          
          <div tw='flex flex-col items-center gap-6'>
            <div tw='flex items-center gap-8'>
              <div tw='flex items-center gap-2 bg-white bg-opacity-20 px-6 py-3 rounded-full'>
                <span tw='text-3xl'>🎫</span>
                <span tw='text-2xl font-semibold'>BeatNFT Insights</span>
              </div>
              <div tw='flex items-center gap-2 bg-white bg-opacity-20 px-6 py-3 rounded-full'>
                <span tw='text-3xl'>⛓️</span>
                <span tw='text-2xl font-semibold'>Web3 Beat Industry</span>
              </div>
            </div>
            <div tw='flex items-center gap-8'>
              <div tw='flex items-center gap-2 bg-white bg-opacity-20 px-6 py-3 rounded-full'>
                <span tw='text-3xl'>🇿🇦</span>
                <span tw='text-2xl font-semibold'>SA Producer Stories</span>
              </div>
              <div tw='flex items-center gap-2 bg-white bg-opacity-20 px-6 py-3 rounded-full'>
                <span tw='text-3xl'>💡</span>
                <span tw='text-2xl font-semibold'>Beat Ownership</span>
              </div>
            </div>
          </div>
          
          <div tw='mt-8 text-center'>
            <div tw='text-2xl font-medium'>Web3 Beat Industry Insights & Guides</div>
          </div>
        </div>
      </div>
    )
  )
}