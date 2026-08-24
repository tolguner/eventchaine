import { Transaction } from '@mysten/sui/transactions';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';

export interface PaymentParams {
  amount: number; // SUI cinsinden
  recipientAddress: string;
  eventId: string;
  eventTitle: string;
  currency?: 'SUI' | 'USDC' | 'USDT';
}

export interface PaymentResult {
  success: boolean;
  txHash?: string;
  digest?: string;
  amountPaid?: number;
  currency?: string;
  explorerUrl?: string;
  error?: string;
}

// Platform cüzdan adresi - .env'den okunmalı
export const PLATFORM_WALLET_ADDRESS = 
  process.env.NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS || 
  '0x742d35cc6634c0532925a3b844bc9e7eb503ae4570b6a6babeaa7e4f0b5c0e49';

/**
 * GERÇEK SUI Ödeme İşlemi
 * Kullanıcı cüzdanından platform cüzdanına SUI transfer eder
 */
export async function processSuiPayment(
  suiClient: SuiClient,
  signer: any, // WalletAccount from dapp-kit
  params: PaymentParams
): Promise<PaymentResult> {
  try {
    const { amount, recipientAddress, eventId, eventTitle, currency = 'SUI' } = params;
    
    console.log('💳 Processing SUI payment...');
    console.log('Amount:', amount, currency);
    console.log('From:', signer.address);
    console.log('To:', recipientAddress);
    console.log('Event:', eventTitle);

    // Minimum ödeme kontrolü
    if (amount <= 0) {
      throw new Error('Ödeme miktarı 0\'dan büyük olmalıdır');
    }

    // Cüzdan bakiyesi kontrolü
    const balance = await suiClient.getBalance({
      owner: signer.address,
      coinType: '0x2::sui::SUI',
    });

    const balanceInSui = Number(balance.totalBalance) / 1_000_000_000;
    console.log('Wallet balance:', balanceInSui, 'SUI');

    if (balanceInSui < amount) {
      throw new Error(`Yetersiz bakiye. Mevcut: ${balanceInSui.toFixed(4)} SUI, Gerekli: ${amount} SUI`);
    }

    // Amount'u MIST'e çevir (1 SUI = 1,000,000,000 MIST)
    const amountInMist = Math.floor(amount * 1_000_000_000);

    // GERÇEK Transaction oluştur
    const tx = new Transaction();
    
    // Split coin işlemi - ödeme tutarını gas coin'inden ayır
    const [paymentCoin] = tx.splitCoins(tx.gas, [amountInMist]);
    
    // Transfer işlemi - platform cüzdanına gönder
    tx.transferObjects([paymentCoin], recipientAddress);

    console.log('📝 Signing and executing payment transaction...');
    
    // Transaction'ı GERÇEKTEN imzala ve blockchain'e gönder
    const result = await signer.signAndExecuteTransaction({
      transaction: tx,
      options: {
        showEffects: true,
        showObjectChanges: true,
        showBalanceChanges: true,
      },
    });

    console.log('✅ Payment transaction executed:', result.digest);

    // Cüzdan yalnızca digest döndürüyor; işlem sonucunu zincirden doğrula
    const confirmed = await suiClient.waitForTransaction({
      digest: result.digest,
      options: { showEffects: true },
    });

    if (confirmed.effects?.status?.status === 'success') {
      const network = process.env.NEXT_PUBLIC_SUI_NETWORK || 'testnet';
      const explorerUrl = `https://suiscan.xyz/${network}/tx/${result.digest}`;

      console.log('🎉 Payment successful!');
      console.log('Amount:', amount, currency);
      console.log('TX Hash:', result.digest);
      console.log('Explorer:', explorerUrl);

      return {
        success: true,
        txHash: result.digest,
        digest: result.digest,
        amountPaid: amount,
        currency: currency,
        explorerUrl,
      };
    } else {
      const errorMessage = confirmed.effects?.status?.error || 'İşlem başarısız oldu';
      console.error('❌ Payment failed:', errorMessage);
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  } catch (error: any) {
    console.error('Sui payment error:', error);
    
    // Hata mesajlarını Türkçeleştir
    let errorMessage = error.message || 'Ödeme başarısız oldu';
    
    if (errorMessage.includes('No valid gas coins found')) {
      errorMessage = 'Geçerli gas coin bulunamadı. Cüzdanınızda yeterli SUI bulunduğundan emin olun.';
    } else if (errorMessage.includes('Insufficient gas')) {
      errorMessage = 'Yetersiz gas. Cüzdanınızda işlem ücreti için yeterli SUI bulunmuyor.';
    } else if (errorMessage.includes('Insufficient balance')) {
      errorMessage = 'Yetersiz bakiye. Cüzdanınızda yeterli SUI bulunmuyor.';
    } else if (errorMessage.includes('rejected')) {
      errorMessage = 'İşlem reddedildi.';
    } else if (errorMessage.includes('User rejected')) {
      errorMessage = 'İşlem kullanıcı tarafından reddedildi.';
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Transaction durumunu kontrol eder
 */
export async function checkTransactionStatus(
  suiClient: SuiClient,
  txHash: string
): Promise<{ success: boolean; status: string }> {
  try {
    const tx = await suiClient.getTransactionBlock({
      digest: txHash,
      options: {
        showEffects: true,
      },
    });

    return {
      success: tx.effects?.status?.status === 'success',
      status: tx.effects?.status?.status || 'unknown',
    };
  } catch (error) {
    console.error('İşlem kontrolü hatası:', error);
    return {
      success: false,
      status: 'hata',
    };
  }
}

/**
 * Cüzdan bakiyesini kontrol eder
 */
export async function getWalletBalance(
  suiClient: SuiClient,
  address: string
): Promise<{ balance: number; formattedBalance: string }> {
  try {
    const balance = await suiClient.getBalance({
      owner: address,
    });

    const balanceInSui = parseInt(balance.totalBalance) / 1_000_000_000;

    return {
      balance: balanceInSui,
      formattedBalance: balanceInSui.toFixed(4),
    };
  } catch (error) {
    console.error('Bakiye alınamadı:', error);
    return {
      balance: 0,
      formattedBalance: '0.0000',
    };
  }
}
