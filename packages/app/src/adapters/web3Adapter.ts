/**
 * Web3 data adapter
 * Fetches and normalizes data from blockchain/IPFS
 */

import { Beat, Producer, DataAdapter } from '@/types/data';

export class Web3Adapter implements DataAdapter {
  private contractAddress: string;
  private ipfsGateway: string;
  
  constructor() {
    this.contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';
    this.ipfsGateway = process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/';
  }
  
  async getProducer(walletAddress: string): Promise<Producer | null> {
    try {
      if (!walletAddress?.startsWith('0x')) return null;
      
      // Dynamic import to prevent SSR issues
      const { readContract } = await import('wagmi/actions');
      const { config } = await import('@/lib/wagmi');
      const { beatNFTABI } = await import('@/abis');
      
      // Get producer's NFT balance
      const balance = await readContract(config, {
        address: this.contractAddress as `0x${string}`,
        abi: beatNFTABI,
        functionName: 'balanceOf',
        args: [walletAddress as `0x${string}`]
      }).catch(() => BigInt(0));
      
      // Try to get producer profile from contract or IPFS
      // This is simplified - in a real implementation, you'd fetch profile data
      
      return {
        id: walletAddress.toLowerCase(),
        name: 'Web3 Producer',
        bio: 'Producer on BeatsChain platform.',
        location: 'Blockchain',
        genres: ['Hip Hop'],
        totalBeats: Number(balance) || 0,
        totalSales: 0,
        verified: false,
        walletAddress
      };
    } catch (error) {
      console.error('Error fetching producer from Web3:', error);
      return null;
    }
  }

  async getProducerBeats(walletAddress: string): Promise<Beat[]> {
    try {
      if (!walletAddress?.startsWith('0x')) return [];
      
      // Dynamic import to prevent SSR issues
      const { readContract } = await import('wagmi/actions');
      const { config } = await import('@/lib/wagmi');
      const { beatNFTABI } = await import('@/abis');
      
      // Get producer's NFT balance
      const balance = await readContract(config, {
        address: this.contractAddress as `0x${string}`,
        abi: beatNFTABI,
        functionName: 'balanceOf',
        args: [walletAddress as `0x${string}`]
      }).catch(() => BigInt(0));
      
      // For now, create mock data since we need to iterate through tokens
      const tokenIds = Array.from({ length: Number(balance || 0) }, (_, i) => BigInt(i + 1));
      
      // Fetch metadata for each token
      const beatPromises = tokenIds.map(async (tokenId) => {
        try {
          const tokenURI = await readContract(config, {
            address: this.contractAddress as `0x${string}`,
            abi: beatNFTABI,
            functionName: 'tokenURI',
            args: [tokenId]
          });
          
          // Fetch IPFS metadata
          const ipfsUrl = tokenURI.replace('ipfs://', this.ipfsGateway);
          const response = await fetch(ipfsUrl);
          const metadata = await response.json();
          
          return {
            id: tokenId.toString(),
            title: metadata.name || 'Untitled Beat',
            description: metadata.description || '',
            producerId: walletAddress.toLowerCase(),
            producerName: metadata.artist || 'Unknown Artist',
            genre: metadata.attributes?.find((attr: any) => attr.trait_type === 'Genre')?.value || 'Hip Hop',
            bpm: parseInt(metadata.attributes?.find((attr: any) => attr.trait_type === 'BPM')?.value || '120'),
            key: metadata.attributes?.find((attr: any) => attr.trait_type === 'Key')?.value || 'C',
            price: parseFloat(metadata.attributes?.find((attr: any) => attr.trait_type === 'Price')?.value || '0.05'),
            audioUrl: metadata.animation_url?.replace('ipfs://', this.ipfsGateway) || '',
            coverImageUrl: metadata.image?.replace('ipfs://', this.ipfsGateway),
            isNFT: true,
            tokenId: tokenId.toString()
          };
        } catch (error) {
          console.warn('Failed to fetch metadata for token:', tokenId, error);
          return null;
        }
      });
      
      const beats = (await Promise.all(beatPromises)).filter(Boolean) as Beat[];
      return beats;
    } catch (error) {
      console.error('Error fetching beats from Web3:', error);
      return [];
    }
  }

  async getAllProducers(): Promise<Producer[]> {
    // This would require indexing events from the contract
    // For now, return empty array as this is complex to implement
    return [];
  }

  async getBeat(tokenId: string): Promise<Beat | null> {
    try {
      if (!tokenId || !this.contractAddress) return null;
      
      // Dynamic import to prevent SSR issues
      const { readContract } = await import('wagmi/actions');
      const { config } = await import('@/lib/wagmi');
      const { beatNFTABI } = await import('@/abis');
      
      // Get token URI
      const tokenURI = await readContract(config, {
        address: this.contractAddress as `0x${string}`,
        abi: beatNFTABI,
        functionName: 'tokenURI',
        args: [BigInt(tokenId)]
      }).catch(() => '');
      
      if (!tokenURI) return null;
      
      // Fetch IPFS metadata
      const ipfsUrl = tokenURI.replace('ipfs://', this.ipfsGateway);
      const response = await fetch(ipfsUrl);
      const metadata = await response.json();
      
      // Get owner
      const owner = await readContract(config, {
        address: this.contractAddress as `0x${string}`,
        abi: beatNFTABI,
        functionName: 'ownerOf',
        args: [BigInt(tokenId)]
      }).catch(() => '');
      
      return {
        id: tokenId,
        title: metadata.name || 'Untitled Beat',
        description: metadata.description || '',
        producerId: owner.toLowerCase(),
        producerName: metadata.artist || 'Unknown Artist',
        genre: metadata.attributes?.find((attr: any) => attr.trait_type === 'Genre')?.value || 'Hip Hop',
        bpm: parseInt(metadata.attributes?.find((attr: any) => attr.trait_type === 'BPM')?.value || '120'),
        key: metadata.attributes?.find((attr: any) => attr.trait_type === 'Key')?.value || 'C',
        price: parseFloat(metadata.attributes?.find((attr: any) => attr.trait_type === 'Price')?.value || '0.05'),
        audioUrl: metadata.animation_url?.replace('ipfs://', this.ipfsGateway) || '',
        coverImageUrl: metadata.image?.replace('ipfs://', this.ipfsGateway),
        isNFT: true,
        tokenId
      };
    } catch (error) {
      console.error('Error fetching beat from Web3:', error);
      return null;
    }
  }

  async getFeaturedBeats(limit: number = 6): Promise<Beat[]> {
    // This would require a curated list or indexing
    // For now, return empty array
    return [];
  }
}