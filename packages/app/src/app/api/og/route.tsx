import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    
    // Get parameters from query
    const title = searchParams.get('title') || 'BeatsChain'
    const subtitle = searchParams.get('subtitle') || 'Web3 Beat Marketplace'
    const type = searchParams.get('type') || 'default'
    
    // Choose background color based on content type
    let bgGradient = 'linear-gradient(to bottom right, #667eea, #764ba2)'
    
    if (type === 'music') {
      bgGradient = 'linear-gradient(to bottom right, #3b82f6, #2dd4bf)'
    } else if (type === 'profile') {
      bgGradient = 'linear-gradient(to bottom right, #8b5cf6, #ec4899)'
    } else if (type === 'article') {
      bgGradient = 'linear-gradient(to bottom right, #f43f5e, #f97316)'
    }
    
    // Generate image response
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: bgGradient,
            fontSize: 60,
            fontWeight: 800,
            color: 'white',
            padding: '0 120px',
            textAlign: 'center',
            textShadow: '0 2px 10px rgba(0,0,0,0.3)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 30,
              left: 30,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <div
              style={{
                fontSize: 30,
                fontWeight: 900,
                background: 'white',
                color: '#764ba2',
                padding: '8px 16px',
                borderRadius: '8px',
              }}
            >
              BeatsChain
            </div>
          </div>
          
          <div style={{ maxWidth: '900px' }}>
            {title}
          </div>
          
          {subtitle && (
            <div
              style={{
                fontSize: 30,
                fontWeight: 400,
                opacity: 0.9,
                marginTop: 20,
              }}
            >
              {subtitle}
            </div>
          )}
          
          <div
            style={{
              position: 'absolute',
              bottom: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
            }}
          >
            <div
              style={{
                fontSize: 24,
                opacity: 0.8,
              }}
            >
              beatschain.app
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (error) {
    console.error('Error generating OG image:', error)
    
    // Return a simple fallback image
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(to bottom right, #667eea, #764ba2)',
            color: 'white',
            fontSize: 60,
            fontWeight: 800,
          }}
        >
          BeatsChain
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  }
}