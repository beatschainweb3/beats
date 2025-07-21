import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'BeatsChain - Upload Your Beats'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        tw='flex flex-col items-center justify-center w-full h-full text-white relative'
        style={{
          background: 'linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)',
        }}>
        
        <div tw='flex flex-col items-center justify-center z-10'>
          <h1 tw='text-7xl font-bold mb-4'>🎵 Upload Your Beats</h1>
          <h2 tw='text-3xl mb-8 text-center'>Turn Your Beats into NFTs</h2>
          
          <div tw='flex flex-col items-center gap-6'>
            <div tw='flex items-center gap-8'>
              <div tw='flex items-center gap-2 bg-white bg-opacity-20 px-6 py-3 rounded-full'>
                <span tw='text-3xl'>🎫</span>
                <span tw='text-2xl font-semibold'>Use BeatNFT Credits</span>
              </div>
              <div tw='flex items-center gap-2 bg-white bg-opacity-20 px-6 py-3 rounded-full'>
                <span tw='text-3xl'>♾️</span>
                <span tw='text-2xl font-semibold'>Pro BeatNFT Unlimited</span>
              </div>
            </div>
            <div tw='flex items-center gap-8'>
              <div tw='flex items-center gap-2 bg-white bg-opacity-20 px-6 py-3 rounded-full'>
                <span tw='text-3xl'>🎧</span>
                <span tw='text-2xl font-semibold'>MP3 • WAV • ZIP</span>
              </div>
              <div tw='flex items-center gap-2 bg-white bg-opacity-20 px-6 py-3 rounded-full'>
                <span tw='text-3xl'>⚡</span>
                <span tw='text-2xl font-semibold'>Instant Minting</span>
              </div>
            </div>
          </div>
          
          <div tw='mt-8 text-center'>
            <div tw='text-2xl font-medium'>1 Credit = MP3 • 2 Credits = WAV • 3-5 Credits = ZIP</div>
          </div>
        </div>
      </div>
    )
  )
}