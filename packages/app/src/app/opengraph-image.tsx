import { SITE_EMOJI, SITE_INFO, SITE_NAME } from '@/utils/site'
import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const alt = `${SITE_NAME} - Web3 Beat Marketplace`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        tw='flex flex-col items-center justify-center w-full h-full text-white relative'
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        }}>
        {/* Background Pattern */}
        <div tw='absolute inset-0 opacity-10'>
          <div tw='flex flex-wrap gap-8 p-8'>
            <div tw='text-6xl'>🎵</div>
            <div tw='text-6xl'>🎧</div>
            <div tw='text-6xl'>🎤</div>
            <div tw='text-6xl'>🎹</div>
            <div tw='text-6xl'>🥁</div>
            <div tw='text-6xl'>🎸</div>
          </div>
        </div>
        
        {/* Main Content */}
        <div tw='flex flex-col items-center justify-center z-10'>
          <h1 tw='text-8xl font-bold mb-4'>
            {SITE_EMOJI} {SITE_NAME}
          </h1>
          <h2 tw='text-4xl mb-8 text-center'>Web3 Beat Marketplace</h2>
          
          {/* Key Features */}
          <div tw='flex flex-col items-center justify-center'>
            <div tw='flex items-center gap-8 mb-4'>
              <div tw='flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-full'>
                <span tw='text-2xl'>🎫</span>
                <span tw='text-xl font-semibold'>BeatNFT Credits</span>
              </div>
              <div tw='flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-full'>
                <span tw='text-2xl'>⛓️</span>
                <span tw='text-xl font-semibold'>NFT Beat Ownership</span>
              </div>
            </div>
            <div tw='flex items-center gap-8'>
              <div tw='flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-full'>
                <span tw='text-2xl'>💰</span>
                <span tw='text-xl font-semibold'>Crypto Payments</span>
              </div>
              <div tw='flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-full'>
                <span tw='text-2xl'>🇿🇦</span>
                <span tw='text-xl font-semibold'>SA Producers</span>
              </div>
            </div>
          </div>
          
          {/* Bottom Text */}
          <div tw='mt-8 text-center'>
            <div tw='text-2xl font-medium'>Buy, Sell & Own Beats as NFTs</div>
            <div tw='text-xl mt-2 opacity-90'>Blockchain-Powered Beat Marketplace</div>
          </div>
        </div>
      </div>
    )
  )
}
