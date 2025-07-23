/**
 * Unified Data Provider
 * Combines Web3 and Sanity data sources with prioritization and fallback
 */

import { Beat, Producer, DataAdapter } from '@/types/data';
import { SanityAdapter } from './sanityAdapter.enhanced';
import { Web3Adapter } from './web3Adapter';

export class UnifiedDataProvider implements DataAdapter {
  private sanityAdapter: SanityAdapter;
  private web3Adapter: Web3Adapter;
  
  constructor() {
    this.sanityAdapter = new SanityAdapter();
    this.web3Adapter = new Web3Adapter();
  }
  
  async getProducer(id: string): Promise<Producer | null> {
    if (!id) {
      console.warn('Empty producer ID provided');
      return null;
    }
    
    try {
      // Try Web3 first if ID looks like a wallet address
      if (id?.startsWith('0x')) {
        try {
          const web3Producer = await this.web3Adapter.getProducer(id);
          if (web3Producer) return web3Producer;
        } catch (error) {
          console.warn('Error fetching producer from Web3:', error);
        }
      }
      
      // Fall back to Sanity
      try {
        const sanityProducer = await this.sanityAdapter.getProducer(id);
        
        if (sanityProducer) {
          // If producer has wallet address, try to enhance with Web3 data
          if (sanityProducer.walletAddress) {
            try {
              const web3Producer = await this.web3Adapter.getProducer(sanityProducer.walletAddress);
              if (web3Producer) {
                // Merge data, prioritizing Web3 for dynamic fields
                return {
                  ...sanityProducer,
                  totalBeats: web3Producer.totalBeats || sanityProducer.totalBeats,
                  totalSales: web3Producer.totalSales || sanityProducer.totalSales
                };
              }
            } catch (error) {
              console.warn('Error enhancing producer with Web3 data:', error);
            }
          }
          
          return sanityProducer;
        }
      } catch (error) {
        console.warn('Error fetching producer from Sanity:', error);
      }
      
      // If we get here, both Web3 and Sanity failed
      return null;
    } catch (error) {
      console.error('Unexpected error in getProducer:', error);
      return null;
    }
  }

  async getProducerBeats(producerId: string): Promise<Beat[]> {
    if (!producerId) {
      console.warn('Empty producer ID provided');
      return [];
    }
    
    try {
      let producer = await this.getProducer(producerId);
      if (!producer) return [];
      
      // Try Web3 first if producer has wallet address
      if (producer.walletAddress) {
        try {
          const web3Beats = await this.web3Adapter.getProducerBeats(producer.walletAddress);
          if (web3Beats && web3Beats.length > 0) return web3Beats;
        } catch (error) {
          console.warn('Error fetching beats from Web3:', error);
        }
      }
      
      // Fall back to Sanity
      try {
        const sanityBeats = await this.sanityAdapter.getProducerBeats(producerId);
        return sanityBeats;
      } catch (error) {
        console.warn('Error fetching beats from Sanity:', error);
      }
      
      // If we get here, both Web3 and Sanity failed
      return [];
    } catch (error) {
      console.error('Unexpected error in getProducerBeats:', error);
      return [];
    }
  }

  async getAllProducers(): Promise<Producer[]> {
    try {
      // Get producers from Sanity
      const sanityProducers = await this.sanityAdapter.getAllProducers();
      
      // Enhance with Web3 data where possible
      const enhancedProducers = await Promise.all(
        sanityProducers.map(async (producer) => {
          if (producer.walletAddress) {
            try {
              const web3Producer = await this.web3Adapter.getProducer(producer.walletAddress);
              if (web3Producer) {
                return {
                  ...producer,
                  totalBeats: web3Producer.totalBeats || producer.totalBeats,
                  totalSales: web3Producer.totalSales || producer.totalSales
                };
              }
            } catch (error) {
              console.warn(`Error enhancing producer ${producer.id} with Web3 data:`, error);
            }
          }
          return producer;
        })
      );
      
      return enhancedProducers;
    } catch (error) {
      console.error('Error in getAllProducers:', error);
      return [];
    }
  }

  async getBeat(id: string): Promise<Beat | null> {
    if (!id) {
      console.warn('Empty beat ID provided');
      return null;
    }
    
    try {
      // Try Web3 first if ID looks like a token ID
      if (/^\d+$/.test(id)) {
        try {
          const web3Beat = await this.web3Adapter.getBeat(id);
          if (web3Beat) return web3Beat;
        } catch (error) {
          console.warn('Error fetching beat from Web3:', error);
        }
      }
      
      // Fall back to Sanity
      return this.sanityAdapter.getBeat(id);
    } catch (error) {
      console.error('Error in getBeat:', error);
      return null;
    }
  }

  async getFeaturedBeats(limit?: number): Promise<Beat[]> {
    try {
      // For now, just use Sanity featured beats
      const beats = await this.sanityAdapter.getFeaturedBeats();
      return beats;
    } catch (error) {
      console.error('Error in getFeaturedBeats:', error);
      return [];
    }
  }
}

// Export singleton instance
export const dataProvider = new UnifiedDataProvider();