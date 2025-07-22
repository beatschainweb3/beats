/**
 * Unified Data Provider
 * Combines Web3 and Sanity data sources with prioritization and fallback
 */

import { Beat, Producer, DataAdapter } from '@/types/data';
import { SanityAdapter } from './sanityAdapter';
import { Web3Adapter } from './web3Adapter';

export class UnifiedDataProvider implements DataAdapter {
  private sanityAdapter: SanityAdapter;
  private web3Adapter: Web3Adapter;
  
  constructor() {
    this.sanityAdapter = new SanityAdapter();
    this.web3Adapter = new Web3Adapter();
  }
  
  async getProducer(id: string): Promise<Producer | null> {
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
    const sanityProducer = await this.sanityAdapter.getProducer(id);
    
    // If producer has wallet address, try to enhance with Web3 data
    if (sanityProducer?.walletAddress) {
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

  async getProducerBeats(producerId: string): Promise<Beat[]> {
    let producer = await this.getProducer(producerId);
    if (!producer) return [];
    
    // Try Web3 first if producer has wallet address
    if (producer.walletAddress) {
      try {
        const web3Beats = await this.web3Adapter.getProducerBeats(producer.walletAddress);
        if (web3Beats.length > 0) return web3Beats;
      } catch (error) {
        console.warn('Error fetching beats from Web3:', error);
      }
    }
    
    // Fall back to Sanity
    return this.sanityAdapter.getProducerBeats(producerId);
  }

  async getAllProducers(): Promise<Producer[]> {
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
  }

  async getBeat(id: string): Promise<Beat | null> {
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
  }

  async getFeaturedBeats(limit: number = 6): Promise<Beat[]> {
    // For now, just use Sanity featured beats
    return this.sanityAdapter.getFeaturedBeats(limit);
  }
}

// Export singleton instance
export const dataProvider = new UnifiedDataProvider();