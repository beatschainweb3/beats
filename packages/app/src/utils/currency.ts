// Exchange rate: 1 ETH ≈ R18,000 (approximate)
export const ETH_TO_ZAR_RATE = 18000

export interface PriceDisplay {
  eth: number
  zar: number
  formatted: {
    eth: string
    zar: string
    combined: string
  }
}

export const formatPrice = (ethPrice: number): PriceDisplay => {
  const zarPrice = ethPrice * ETH_TO_ZAR_RATE
  
  return {
    eth: ethPrice,
    zar: zarPrice,
    formatted: {
      eth: `${ethPrice.toFixed(3)} ETH`,
      zar: `R${zarPrice.toLocaleString()}`,
      combined: `${ethPrice.toFixed(3)} ETH (~R${Math.round(zarPrice).toLocaleString()})`
    }
  }
}

export const formatCurrency = (amount: number, currency: 'ETH' | 'ZAR' = 'ETH'): string => {
  if (currency === 'ETH') {
    return `${amount.toFixed(3)} ETH`
  }
  return `R${amount.toLocaleString()}`
}

export const convertPrice = (amount: number, from: 'ETH' | 'ZAR', to: 'ETH' | 'ZAR'): number => {
  if (from === to) return amount
  
  if (from === 'ETH' && to === 'ZAR') {
    return amount * ETH_TO_ZAR_RATE
  }
  
  if (from === 'ZAR' && to === 'ETH') {
    return amount / ETH_TO_ZAR_RATE
  }
  
  return amount
}

// Price display component props
export interface PriceDisplayProps {
  ethPrice: number
  showBoth?: boolean
  primary?: 'ETH' | 'ZAR'
  className?: string
}