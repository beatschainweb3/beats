'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import TransactionHistory from '@/components/TransactionHistory'
import { useAccount } from 'wagmi'

export default function BlockchainDashboardPage() {
  const { address, chain } = useAccount()
  const [activeTab, setActiveTab] = useState('transactions')
  
  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold mb-6">⛓️ Blockchain Dashboard</h1>
        
        {/* Wallet Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Wallet Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Connected Address</p>
              <p className="font-mono bg-gray-100 p-2 rounded break-all">
                {address || 'Not connected'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Network</p>
              <div className="flex items-center">
                <span className={`w-3 h-3 rounded-full mr-2 ${chain?.id === 1 ? 'bg-blue-500' : chain?.id === 11155111 ? 'bg-purple-500' : 'bg-green-500'}`}></span>
                <span>{chain?.name || 'Not connected'}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('transactions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'transactions'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Transactions
            </button>
            <button
              onClick={() => setActiveTab('credits')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'credits'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              BeatNFT Credits
            </button>
            <button
              onClick={() => setActiveTab('nfts')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'nfts'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              NFT Ownership
            </button>
          </div>
        </div>
        
        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {activeTab === 'transactions' && (
            <div>
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h3 className="font-medium">Transaction History</h3>
                <p className="text-sm text-gray-500">View all your blockchain transactions</p>
              </div>
              <TransactionHistory />
            </div>
          )}
          
          {activeTab === 'credits' && (
            <div className="p-6">
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🎫</div>
                <h3 className="text-xl font-medium mb-2">BeatNFT Credits</h3>
                <p className="text-gray-600 mb-6">
                  View your BeatNFT credit balance and purchase history
                </p>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  Purchase Credits
                </button>
              </div>
            </div>
          )}
          
          {activeTab === 'nfts' && (
            <div className="p-6">
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🖼️</div>
                <h3 className="text-xl font-medium mb-2">NFT Ownership</h3>
                <p className="text-gray-600 mb-6">
                  View your owned BeatNFTs and license tokens
                </p>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  View NFT Gallery
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Blockchain Resources */}
        <div className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-100">
          <h2 className="text-xl font-bold mb-4">Blockchain Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a 
              href={`https://${chain?.id === 1 ? '' : 'sepolia.'}etherscan.io/address/${address}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="mr-4 text-2xl">🔍</div>
              <div>
                <h3 className="font-medium">View on Etherscan</h3>
                <p className="text-sm text-gray-500">Check your on-chain activity</p>
              </div>
            </a>
            
            <a 
              href="https://sepolia.etherscan.io/address/0x950d8627eeb5361fc7f723fc6e23e223d751b23a" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="mr-4 text-2xl">📄</div>
              <div>
                <h3 className="font-medium">BeatNFT Contract</h3>
                <p className="text-sm text-gray-500">View the smart contract</p>
              </div>
            </a>
            
            <a 
              href="https://docs.beatschain.app/blockchain" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="mr-4 text-2xl">📚</div>
              <div>
                <h3 className="font-medium">Documentation</h3>
                <p className="text-sm text-gray-500">Learn about Web3 features</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}