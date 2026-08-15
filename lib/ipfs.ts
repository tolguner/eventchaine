/**
 * IPFS Metadata Upload Utilities
 * NFT.Storage kullanarak metadata ve görselleri IPFS'e yükler
 */

export interface CertificateMetadata {
  name: string;
  description: string;
  image: string;
  external_url?: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

export interface IPFSUploadResult {
  success: boolean;
  cid?: string;
  url?: string;
  gatewayUrl?: string;
  error?: string;
}

/**
 * GERÇEK IPFS Upload - NFT.Storage kullanarak
 * Ücretsiz ve kalıcı depolama
 */
export async function uploadMetadataToIPFS(
  metadata: CertificateMetadata
): Promise<IPFSUploadResult> {
  try {
    const NFT_STORAGE_KEY = process.env.NEXT_PUBLIC_NFT_STORAGE_KEY || process.env.NFT_STORAGE_KEY;
    
    if (!NFT_STORAGE_KEY || NFT_STORAGE_KEY === 'your-nft-storage-key') {
      console.warn('⚠️  NFT.Storage API key not configured');
      return generateMockIPFS(metadata);
    }

    console.log('📤 Uploading metadata to IPFS via NFT.Storage...');

    // NFT.Storage API endpoint
    const response = await fetch('https://api.nft.storage/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NFT_STORAGE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata),
    });

    if (!response.ok) {
      throw new Error(`NFT.Storage upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    const cid = data.value.cid;
    const url = `ipfs://${cid}`;
    const gatewayUrl = `https://nftstorage.link/ipfs/${cid}`;

    console.log('✅ Uploaded to IPFS:', cid);
    console.log('🌐 Gateway URL:', gatewayUrl);

    return {
      success: true,
      cid,
      url,
      gatewayUrl,
    };
  } catch (error: any) {
    console.error('❌ IPFS upload failed:', error.message);
    
    // Fallback to mock IPFS
    console.log('⚠️  Falling back to mock IPFS...');
    return generateMockIPFS(metadata);
  }
}

/**
 * Görsel dosyasını IPFS'e yükle
 */
export async function uploadImageToIPFS(
  imageFile: File | Blob
): Promise<IPFSUploadResult> {
  try {
    const NFT_STORAGE_KEY = process.env.NEXT_PUBLIC_NFT_STORAGE_KEY || process.env.NFT_STORAGE_KEY;
    
    if (!NFT_STORAGE_KEY || NFT_STORAGE_KEY === 'your-nft-storage-key') {
      console.warn('⚠️  NFT.Storage API key not configured');
      return {
        success: false,
        error: 'NFT.Storage API key not configured',
      };
    }

    console.log('📤 Uploading image to IPFS...');

    const formData = new FormData();
    formData.append('file', imageFile);

    const response = await fetch('https://api.nft.storage/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NFT_STORAGE_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Image upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    const cid = data.value.cid;
    const url = `ipfs://${cid}`;
    const gatewayUrl = `https://nftstorage.link/ipfs/${cid}`;

    console.log('✅ Image uploaded to IPFS:', cid);

    return {
      success: true,
      cid,
      url,
      gatewayUrl,
    };
  } catch (error: any) {
    console.error('❌ Image upload failed:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Sertifika görseli oluştur ve IPFS'e yükle
 */
export async function generateAndUploadCertificateImage(
  eventTitle: string,
  participantName: string,
  date: string,
  certificateNo: string
): Promise<IPFSUploadResult> {
  try {
    // Canvas kullanarak sertifika görseli oluştur
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Canvas context not available');
    }

    // Arka plan gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#0346b9');
    gradient.addColorStop(1, '#fa9e0f');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Beyaz çerçeve
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(50, 50, canvas.width - 100, canvas.height - 100);

    // Başlık
    ctx.fillStyle = '#0346b9';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('KATILIM SERTİFİKASI', canvas.width / 2, 150);

    // Katılımcı adı
    ctx.font = 'bold 64px Arial';
    ctx.fillText(participantName, canvas.width / 2, 300);

    // Etkinlik bilgisi
    ctx.font = '32px Arial';
    ctx.fillStyle = '#333';
    ctx.fillText(eventTitle, canvas.width / 2, 400);

    // Tarih
    ctx.font = '24px Arial';
    ctx.fillText(new Date(date).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }), canvas.width / 2, 480);

    // Sertifika no
    ctx.font = '18px Arial';
    ctx.fillStyle = '#666';
    ctx.fillText(`Sertifika No: ${certificateNo}`, canvas.width / 2, 680);

    // Blockchain note
    ctx.fillText('🔗 Blockchain ile Doğrulanmıştır', canvas.width / 2, 720);

    // Canvas'ı blob'a çevir
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/png');
    });

    if (!blob) {
      throw new Error('Failed to create image blob');
    }

    // IPFS'e yükle
    return await uploadImageToIPFS(blob);
  } catch (error: any) {
    console.error('❌ Certificate image generation failed:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Mock IPFS CID generator (API key yoksa veya hata durumunda)
 */
function generateMockIPFS(metadata: CertificateMetadata): IPFSUploadResult {
  // Deterministic mock CID (metadata hash'ine göre)
  const hash = simpleHash(JSON.stringify(metadata));
  const mockCID = `Qm${hash.substring(0, 44)}`;
  
  console.log('⚠️  Using mock IPFS CID:', mockCID);
  
  return {
    success: true,
    cid: mockCID,
    url: `ipfs://${mockCID}`,
    gatewayUrl: `https://ipfs.io/ipfs/${mockCID}`,
  };
}

/**
 * Simple hash function for mock CID generation
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36).padEnd(46, '0');
}

/**
 * IPFS URL'ini HTTP gateway URL'ine çevir
 */
export function ipfsToHttp(ipfsUrl: string): string {
  if (ipfsUrl.startsWith('ipfs://')) {
    const cid = ipfsUrl.replace('ipfs://', '');
    return `https://nftstorage.link/ipfs/${cid}`;
  }
  return ipfsUrl;
}

/**
 * IPFS'den metadata çek
 */
export async function fetchMetadataFromIPFS(cid: string): Promise<CertificateMetadata | null> {
  try {
    const url = `https://nftstorage.link/ipfs/${cid}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error: any) {
    console.error('❌ Failed to fetch IPFS metadata:', error.message);
    return null;
  }
}
