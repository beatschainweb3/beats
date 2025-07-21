import { ImageResponse } from 'next/og'
import { getPageBySlug } from '@/lib/sanity-client'
import fallbackContent from '@/utils/fallbackContent'
 
export const runtime = 'edge'
 
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug
    
    // Try to get page data from Sanity
    const pageData = await getPageBySlug(slug)
    
    // Use fallback if Sanity data isn't available
    const title = pageData?.title || 
                 fallbackContent[slug]?.title || 
                 'BeatsChain'
    
    const description = pageData?.seo?.metaDescription || 
                       'Web3 beat marketplace connecting SA producers with global artists'
    
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            height: '100%',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            backgroundImage: 'linear-gradient(to bottom right, #4F46E5, #7C3AED)',
            fontSize: 60,
            letterSpacing: -2,
            fontWeight: 700,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              backgroundImage: 'linear-gradient(90deg, rgb(255, 255, 255), rgb(168, 85, 247))',
              backgroundClip: 'text',
              '-webkit-background-clip': 'text',
              color: 'transparent',
              padding: '20px 40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="80" height="80" viewBox="0 0 24 24" fill="white">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
            <div style={{ marginLeft: '20px' }}>BeatsChain</div>
          </div>
          <div
            style={{
              fontSize: 30,
              background: 'white',
              color: 'black',
              borderRadius: '10px',
              padding: '10px 20px',
              marginTop: '20px',
              maxWidth: '80%',
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 20,
              color: 'white',
              marginTop: '10px',
              maxWidth: '70%',
              opacity: 0.8,
            }}
          >
            {description}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (e) {
    console.error(`Error generating OG image: ${e.message}`)
    return new Response(`Failed to generate image`, {
      status: 500,
    })
  }
}