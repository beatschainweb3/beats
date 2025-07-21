import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const producerId = searchParams.get('producerId')

    if (!producerId) {
      return NextResponse.json({ error: 'Producer ID required' }, { status: 400 })
    }

    // Get producer's beats
    const beatsSnapshot = await adminDb
      .collection('beats')
      .where('producerId', '==', producerId)
      .get()

    // Get producer's transactions
    const transactionsSnapshot = await adminDb
      .collection('transactions')
      .where('producerId', '==', producerId)
      .where('status', '==', 'completed')
      .get()

    let totalEarnings = 0
    let totalSales = 0
    let monthlyEarnings = 0

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    transactionsSnapshot.forEach(doc => {
      const transaction = doc.data()
      const amount = transaction.amount || 0
      const producerShare = amount * 0.85 // 85% to producer

      totalEarnings += producerShare
      totalSales += 1

      if (transaction.createdAt?.toDate() >= thirtyDaysAgo) {
        monthlyEarnings += producerShare
      }
    })

    // Estimate plays (150 plays per sale average)
    const totalPlays = totalSales * 150

    const stats = {
      totalEarnings: Math.round(totalEarnings * 100) / 100,
      totalSales,
      totalPlays,
      monthlyEarnings: Math.round(monthlyEarnings * 100) / 100,
      totalBeats: beatsSnapshot.size
    }

    return NextResponse.json({ stats })

  } catch (error: any) {
    console.error('Error fetching producer stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch producer stats', details: error.message },
      { status: 500 }
    )
  }
}