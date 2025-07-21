import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { SITE_NAME } from '@/utils/site'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    
    // Get dynamic parameters from the request
    const title = searchParams.get('title') || 'BeatsChain'
    const description = searchParams.get('description') || 'Web3 Beat Marketplace'
    const type = searchParams.get('type') || 'default'
    
    // Font
    const interFont = await fetch(
      new URL('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap', req.url)
    ).then((res) => res.arrayBuffer())
    
    // Generate the image based on type
    return new ImageResponse(
      (
        <div
          tw="flex flex-col items-center justify-center w-full h-full text-white relative"
          style={{
            background: type === 'beat' 
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              : type === 'blog' 
                ? 'linear-gradient(135deg, #1f2937 0%, #374151 50%, #4b5563 100%)'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
          }}>
          
          {/* Background Pattern */}
          <div tw="absolute inset-0 opacity-10">
            <div tw="flex flex-wrap gap-8 p-8">
              <div tw="text-6xl">🎵</div>
              <div tw="text-6xl">🎧</div>
              <div tw="text-6xl">🎤</div>
              <div tw="text-6xl">🎹</div>
              <div tw="text-6xl">🥁</div>
              <div tw="text-6xl">🎸</div>
            </div>
          </div>
          
          {/* Main Content */}
          <div tw="flex flex-col items-center justify-center z-10 max-w-5xl text-center px-10">
            <h1 tw="text-6xl font-bold mb-6">{title}</h1>
            <h2 tw="text-3xl mb-8">{description}</h2>
            
            {/* Key Features */}
            <div tw="flex flex-col items-center justify-center">
              <div tw="flex items-center gap-8 mb-4">
                <div tw="flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-full">
                  <span tw="text-2xl">🎫</span>
                  <span tw="text-xl font-semibold">BeatNFT Credits</span>
                </div>
                <div tw="flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-full">
                  <span tw="text-2xl">⛓️</span>
                  <span tw="text-xl font-semibold">NFT Beat Ownership</span>
                </div>
              </div>
            </div>
            
            {/* Bottom Text */}
            <div tw="mt-8 text-center">
              <div tw="text-2xl font-medium">{SITE_NAME}</div>
              <div tw="text-xl mt-2 opacity-90">Web3 Beat Marketplace</div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: 'Inter',
            data: interFont,
            style: 'normal',
            weight: 400,
          },
        ],
      }
    )
  } catch (error) {
    console.error('Error generating OG image:', error)
    return new Response('Failed to generate image', { status: 500 })
  }
}