'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Beat } from '@/types/data';
import { toast } from 'react-hot-toast';

interface PurchaseContextType {
  selectedBeat: Beat | null;
  showPurchaseModal: boolean;
  selectBeatForPurchase: (beat: Beat) => void;
  closePurchaseModal: () => void;
}

const PurchaseContext = createContext<PurchaseContextType | undefined>(undefined);

export function PurchaseProvider({ children }: { children: ReactNode }) {
  const [selectedBeat, setSelectedBeat] = useState<Beat | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  const selectBeatForPurchase = (beat: Beat) => {
    setSelectedBeat(beat);
    setShowPurchaseModal(true);
  };

  const closePurchaseModal = () => {
    setShowPurchaseModal(false);
  };

  return (
    <PurchaseContext.Provider
      value={{
        selectedBeat,
        showPurchaseModal,
        selectBeatForPurchase,
        closePurchaseModal,
      }}
    >
      {children}
      {showPurchaseModal && selectedBeat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">{selectedBeat.title}</h2>
              <button onClick={closePurchaseModal} className="text-gray-400 hover:text-gray-600 text-2xl font-light">×</button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600">{selectedBeat.genre} • {selectedBeat.bpm} BPM • {selectedBeat.key}</p>
              <div className="text-xl font-bold text-green-600 mt-2">
                {selectedBeat.price.toFixed(3)} ETH
              </div>
              <div className="text-sm text-gray-500">
                ~R{Math.round(selectedBeat.price * 18000).toLocaleString()}
              </div>
            </div>
            
            <div className="flex justify-end gap-4 mt-6">
              <button 
                onClick={closePurchaseModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  toast.success(`Beat purchase initiated for ${selectedBeat.title}`);
                  closePurchaseModal();
                }}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Purchase
              </button>
            </div>
          </div>
        </div>
      )}
    </PurchaseContext.Provider>
  );
}

export function usePurchase() {
  const context = useContext(PurchaseContext);
  if (context === undefined) {
    throw new Error('usePurchase must be used within a PurchaseProvider');
  }
  return context;
}