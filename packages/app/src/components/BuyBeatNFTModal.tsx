'use client'

import React, { useState } from 'react'
import { useBeatNFT } from '@/hooks/useBeatNFT'
import { toast } from 'react-toastify'

interface BuyBeatNFTModalProps {
  isOpen: boolean
  onClose: () => void
  requiredCredits?: number
}

export default function BuyBeatNFTModal({ isOpen, onClose, requiredCredits = 1 }: BuyBeatNFTModalProps) {
  const [selectedPackage, setSelectedPackage] = useState('small')
  const [loading, setLoading] = useState(false)
  const { buyCredits, upgradeToProNFT, balance } = useBeatNFT()

  const packages = [
    { id: 'small', name: '10 Credits', credits: 10, price: 0.01, priceZAR: 180 },
    { id: 'medium', name: '25 Credits', credits: 25, price: 0.02, priceZAR: 360 },
    { id: 'large', name: '50 Credits', credits: 50, price: 0.035, priceZAR: 630 },
    { id: 'pro', name: 'Pro BeatNFT', credits: -1, price: 0.1, priceZAR: 1800, unlimited: true }
  ]

  const handlePurchase = async () => {
    setLoading(true)
    
    try {
      const pkg = packages.find(p => p.id === selectedPackage)
      if (!pkg) return
      
      let success = false
      
      if (pkg.unlimited) {
        success = await upgradeToProNFT()
        if (success) {
          toast.success('🎉 Upgraded to Pro BeatNFT! Unlimited uploads!')
        }
      } else {
        success = await buyCredits(pkg.credits)
        if (success) {
          toast.success(`✅ Purchased ${pkg.credits} BeatNFT credits!`)
        }
      }
      
      if (success) {
        onClose()
      } else {
        toast.error('Purchase failed. Please try again.')
      }
    } catch (error) {
      console.error('Purchase error:', error)
      toast.error('Purchase failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">🎫 Buy BeatNFT Credits</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {requiredCredits > balance.credits && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
            <p className="text-orange-800 text-sm">
              ⚠️ You need {requiredCredits} credits but only have {balance.credits}. 
              Purchase more to continue uploading.
            </p>
          </div>
        )}

        <div className="space-y-3 mb-6">
          {packages.map((pkg) => (
            <label
              key={pkg.id}
              className={`block border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                selectedPackage === pkg.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="package"
                value={pkg.id}
                checked={selectedPackage === pkg.id}
                onChange={(e) => setSelectedPackage(e.target.value)}
                className="sr-only"
              />
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold text-gray-900">
                    {pkg.unlimited ? '♾️' : '🎫'} {pkg.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {pkg.unlimited ? 'Unlimited uploads forever' : `${pkg.credits} upload credits`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">
                    {pkg.price.toFixed(3)} ETH
                  </div>
                  <div className="text-sm text-gray-500">
                    ~R{pkg.priceZAR.toLocaleString()}
                  </div>
                </div>
              </div>
            </label>
          ))}
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-2">💡 How it works:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• MP3 uploads: 1 credit</li>
            <li>• WAV uploads: 2 credits</li>
            <li>• ZIP (stems): 3-5 credits</li>
            <li>• Pro BeatNFT: Unlimited uploads</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handlePurchase}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-md hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </div>
            ) : (
              `Purchase ${packages.find(p => p.id === selectedPackage)?.name}`
            )}
          </button>
        </div>
      </div>
    </div>
  )
}