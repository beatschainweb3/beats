import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'BeatsChain Producer'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: { id: string } }) {
  // In production, fetch producer data from API
  const producerName = 'Producer Name'
  const totalBeats = '12'
  const totalSales = '8'
  
  return new ImageResponse(
    (
      <div
        tw='flex items-center justify-center w-full h-full text-white relative'
        style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        }}>
        
        <div tw='flex items-center justify-center z-10 max-w-4xl mx-auto px-8'>
          <div tw='flex flex-col items-center text-center'>
            <div tw='text-6xl mb-4'>🎤</div>
            <h1 tw='text-5xl font-bold mb-4'>{producerName}</h1>
            <h2 tw='text-3xl mb-6 opacity-90'>SA Beat Producer</h2>
            
            <div tw='flex items-center gap-8 mb-6'>
              <div tw='flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-full'>
                <span tw='text-2xl'>🎵</span>
                <span tw='text-xl font-semibold'>{totalBeats} Beats</span>
              </div>
              <div tw='flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-full'>
                <span tw='text-2xl'>💰</span>
                <span tw='text-xl font-semibold'>{totalSales} Sales</span>
              </div>
            </div>
            
            <div tw='text-2xl font-medium opacity-80'>
              Web3 Beat Producer • BeatsChain
            </div>
          </div>
        </div>
      </div>
    )
  )
}