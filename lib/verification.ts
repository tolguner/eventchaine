/**
 * On-Chain Certificate Verification
 * Blockchain'den sertifika doğrulama ve NFT bilgilerini çekme
 */

import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';

export interface CertificateVerificationResult {
  valid: boolean;
  exists: boolean;
  objectId?: string;
  owner?: string;
  metadata?: {
    name?: string;
    description?: string;
    image_url?: string;
    attributes?: any;
  };
  transactionDigest?: string;
  explorerUrl?: string;
  error?: string;
}

/**
 * GERÇEK ON-CHAIN DOĞRULAMA
 * SUI blockchain'den NFT'yi sorgular ve doğrular
 */
export async function verifyCertificateOnChain(
  objectId: string,
  network: 'mainnet' | 'testnet' | 'devnet' = 'testnet'
): Promise<CertificateVerificationResult> {
  try {
    console.log('🔍 Verifying certificate on-chain...');
    console.log('Object ID:', objectId);
    console.log('Network:', network);

    // SUI client oluştur
    const suiClient = new SuiClient({ 
      url: getFullnodeUrl(network) 
    });

    // Blockchain'den NFT objesini sorgula
    const object = await suiClient.getObject({
      id: objectId,
      options: {
        showContent: true,
        showOwner: true,
        showPreviousTransaction: true,
        showType: true,
      },
    });

    // Obje var mı kontrol et
    if (!object.data) {
      console.log('❌ Certificate not found on blockchain');
      return {
        valid: false,
        exists: false,
        error: 'Sertifika blockchain\'de bulunamadı',
      };
    }

    console.log('✅ Certificate found on-chain!');

    // Owner bilgisini al
    const owner = 
      object.data.owner && typeof object.data.owner === 'object' && 'AddressOwner' in object.data.owner
        ? object.data.owner.AddressOwner
        : 'Unknown';

    // Metadata'yı parse et
    let metadata: any = {};
    if (object.data.content && 'fields' in object.data.content) {
      const fields = object.data.content.fields as any;
      metadata = {
        name: fields.name || 'Proof of Presence Certificate',
        description: fields.description || '',
        image_url: fields.image_url || fields.url || '',
        attributes: fields.attributes || {},
      };
    }

    const explorerUrl = `https://suiscan.xyz/${network}/object/${objectId}`;

    console.log('Owner:', owner);
    console.log('Type:', object.data.type);
    console.log('Explorer:', explorerUrl);

    return {
      valid: true,
      exists: true,
      objectId: object.data.objectId,
      owner,
      metadata,
      transactionDigest: object.data.previousTransaction || undefined,
      explorerUrl,
    };
  } catch (error: any) {
    console.error('❌ On-chain verification failed:', error.message);
    
    return {
      valid: false,
      exists: false,
      error: error.message || 'Blockchain doğrulama başarısız oldu',
    };
  }
}

/**
 * Transaction hash ile sertifika doğrula
 */
export async function verifyCertificateByTransaction(
  txDigest: string,
  network: 'mainnet' | 'testnet' | 'devnet' = 'testnet'
): Promise<CertificateVerificationResult> {
  try {
    console.log('🔍 Verifying certificate by transaction...');
    console.log('TX Digest:', txDigest);

    const suiClient = new SuiClient({ 
      url: getFullnodeUrl(network) 
    });

    // Transaction bilgilerini al
    const txBlock = await suiClient.getTransactionBlock({
      digest: txDigest,
      options: {
        showEffects: true,
        showObjectChanges: true,
      },
    });

    if (!txBlock) {
      return {
        valid: false,
        exists: false,
        error: 'Transaction bulunamadı',
      };
    }

    // Transaction'da oluşturulan objeleri bul
    const createdObjects = txBlock.objectChanges?.filter(
      (change: any) => change.type === 'created'
    );

    if (!createdObjects || createdObjects.length === 0) {
      return {
        valid: false,
        exists: false,
        error: 'Transaction\'da NFT bulunamadı',
      };
    }

    // İlk oluşturulan objeyi al (NFT olmalı)
    const nftObjectId = (createdObjects[0] as any).objectId;

    // Obje detaylarını al
    return await verifyCertificateOnChain(nftObjectId, network);
  } catch (error: any) {
    console.error('❌ Transaction verification failed:', error.message);
    
    return {
      valid: false,
      exists: false,
      error: error.message || 'Transaction doğrulama başarısız oldu',
    };
  }
}

/**
 * Kullanıcının sahip olduğu tüm sertifikaları listele
 */
export async function getUserCertificates(
  ownerAddress: string,
  network: 'mainnet' | 'testnet' | 'devnet' = 'testnet'
): Promise<CertificateVerificationResult[]> {
  try {
    console.log('📋 Fetching user certificates...');
    console.log('Owner:', ownerAddress);

    const suiClient = new SuiClient({ 
      url: getFullnodeUrl(network) 
    });

    // Kullanıcıya ait tüm objeleri al
    const ownedObjects = await suiClient.getOwnedObjects({
      owner: ownerAddress,
      options: {
        showContent: true,
        showType: true,
      },
    });

    if (!ownedObjects.data || ownedObjects.data.length === 0) {
      console.log('No certificates found for user');
      return [];
    }

    console.log(`Found ${ownedObjects.data.length} objects`);

    // NFT sertifikalarını filtrele (type'ına göre)
    const certificates: CertificateVerificationResult[] = [];
    const NFT_PACKAGE_ID = process.env.NEXT_PUBLIC_SUI_PACKAGE_ID;

    for (const obj of ownedObjects.data) {
      const objectData = obj.data;
      if (!objectData) continue;

      // Sadece Proof of Presence NFT'lerini al
      if (NFT_PACKAGE_ID && objectData.type?.includes(NFT_PACKAGE_ID)) {
        const verification = await verifyCertificateOnChain(objectData.objectId, network);
        if (verification.valid) {
          certificates.push(verification);
        }
      }
    }

    console.log(`✅ Found ${certificates.length} certificates`);
    return certificates;
  } catch (error: any) {
    console.error('❌ Failed to fetch user certificates:', error.message);
    return [];
  }
}

/**
 * Sertifikayı blockchain explorer'da aç
 */
export function getExplorerUrl(
  objectId: string,
  network: 'mainnet' | 'testnet' | 'devnet' = 'testnet',
  type: 'object' | 'transaction' = 'object'
): string {
  return `https://suiscan.xyz/${network}/${type}/${objectId}`;
}

/**
 * Soulbound (transfer edilemez) durumunu kontrol et
 */
export async function isSoulbound(
  objectId: string,
  network: 'mainnet' | 'testnet' | 'devnet' = 'testnet'
): Promise<boolean> {
  try {
    const verification = await verifyCertificateOnChain(objectId, network);
    
    // Metadata'dan soulbound flag'ini kontrol et
    if (verification.metadata?.attributes) {
      return verification.metadata.attributes.soulbound === true;
    }
    
    // Varsayılan olarak tüm Proof of Presence NFT'leri soulbound
    return true;
  } catch (error) {
    console.error('Soulbound check failed:', error);
    return false;
  }
}
