import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'BeatsChain Beat'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: { id: string } }) {
  // Try to fetch real beat data
  let beatTitle = 'Beat'
  let producerName = 'BeatsChain Producer'
  let genre = 'Hip Hop'
  let price = '0.05 ETH'
  
  try {
    // First try to get from Web3 data
    const { TestDataManager } = await import('@/utils/testData')
    const beats = TestDataManager.getTestBeats()
    const beat = beats.find(b => b.id === params.id)
    
    if (beat) {
      beatTitle = beat.title
      producerName = beat.producerName || 'BeatsChain Producer'
      genre = beat.genre || 'Hip Hop'
      price = `${beat.price} ETH`
    }
  } catch (error) {
    console.error('Failed to fetch beat data for OG image:', error)
  }

  return new ImageResponse(
    (
      <div
        tw='flex items-center justify-center w-full h-full text-white relative'
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}>
        
        <div tw='flex items-center justify-center z-10 max-w-4xl mx-auto px-8'>
          <div tw='flex flex-col items-center text-center'>
            <div tw='text-6xl mb-4'>🎵</div>
            <h1 tw='text-5xl font-bold mb-4'>{beatTitle}</h1>
            <h2 tw='text-3xl mb-6 opacity-90'>by {producerName}</h2>
            
            <div tw='flex items-center gap-8 mb-6'>
              <div tw='flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-full'>
                <span tw='text-2xl'>🎧</span>
                <span tw='text-xl font-semibold'>{genre}</span>
              </div>
              <div tw='flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-full'>
                <span tw='text-2xl'>💰</span>
                <span tw='text-xl font-semibold'>{price}</span>
              </div>
            </div>
            
            <div tw='text-2xl font-medium opacity-80'>
              Web3 Beat Ownership • BeatsChain
            </div>
          </div>
        </div>
      </div>
    )
  )
}