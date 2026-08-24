'use client';

import { useState, useEffect } from 'react';
import { useCurrentAccount, useSuiClient, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Modal } from './Modal';
import Button from './Button';
import { processSuiPayment, getWalletBalance } from '@/lib/suiPayment';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: {
    id: string;
    title: string;
    price: number;
    currency: string;
  };
  onSuccess: (txHash: string) => void;
}

export function PaymentModal({ isOpen, onClose, event, onSuccess }: PaymentModalProps) {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [balance, setBalance] = useState<string>('0.0000');
  const [adminWallet, setAdminWallet] = useState<string>('');

  useEffect(() => {
    if (currentAccount && isOpen) {
      loadBalance();
      loadAdminWallet();
    }
  }, [currentAccount, isOpen]);

  const loadAdminWallet = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/wallet', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.wallet_address) {
        setAdminWallet(data.wallet_address);
      }
    } catch (err) {
      console.error('Failed to load admin wallet:', err);
    }
  };

  const loadBalance = async () => {
    if (!currentAccount) return;
    
    const { formattedBalance } = await getWalletBalance(suiClient, currentAccount.address);
    setBalance(formattedBalance);
  };

  const handlePayment = async () => {
    if (!currentAccount) {
      setError('Lütfen önce cüzdanınızı bağlayın');
      return;
    }

    if (!adminWallet) {
      setError('Admin cüzdanı bulunamadı. Lütfen daha sonra tekrar deneyin.');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const result = await processSuiPayment(
        suiClient,
        { address: currentAccount.address, signAndExecuteTransaction },
        {
          amount: event.price,
          recipientAddress: adminWallet,
          eventId: event.id,
          eventTitle: event.title,
        }
      );

      if (result.success && result.txHash) {
        onSuccess(result.txHash);
        onClose();
      } else {
        setError(result.error || 'Ödeme başarısız oldu');
      }
    } catch (err: any) {
      setError(err.message || 'Ödeme sırasında bir hata oluştu');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ödeme Yap">
      <div className="space-y-6">
        {/* Event Info */}
        <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
          <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            {event.title}
          </h3>
          <div className="flex items-center justify-between">
            <span style={{ color: 'var(--text-secondary)' }}>Ödeme Tutarı:</span>
            <span className="text-2xl font-bold" style={{ color: 'var(--accent-primary)' }}>
              {event.price} SUI
            </span>
          </div>
        </div>

        {/* Wallet Info */}
        {currentAccount && (
          <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Cüzdan Bakiyesi:</span>
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                {balance} SUI
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Cüzdan Adresi:</span>
              <span className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>
                {currentAccount.address.slice(0, 8)}...{currentAccount.address.slice(-6)}
              </span>
            </div>
          </div>
        )}

        {/* Admin Wallet Info */}
        {adminWallet && (
          <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(3, 70, 185, 0.1)', border: '1px solid var(--accent-secondary)' }}>
            <p className="text-sm mb-2 font-semibold" style={{ color: 'var(--text-primary)' }}>
              💰 Ödeme Alıcısı
            </p>
            <p className="text-xs font-mono break-all" style={{ color: 'var(--text-secondary)' }}>
              {adminWallet}
            </p>
          </div>
        )}

        {/* Payment Info */}
        <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(250, 158, 15, 0.1)', border: '1px solid var(--accent-primary)' }}>
          <p className="text-sm mb-2" style={{ color: 'var(--text-primary)' }}>
            ℹ️ Ödeme Bilgileri
          </p>
          <ul className="text-xs space-y-1" style={{ color: 'var(--text-secondary)' }}>
            <li>• Ödeme Sui Testnet üzerinden yapılacak</li>
            <li>• İşlem blockchain'e kaydedilecek</li>
            <li>• Gas ücretleri ödeme tutarına eklenir</li>
            <li>• İşlem geri alınamaz</li>
          </ul>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-xl p-4" style={{ backgroundColor: '#fee', border: '1px solid #fcc' }}>
            <p className="text-sm text-red-600">❌ {error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={onClose}
            variant="secondary"
            className="flex-1"
            disabled={isProcessing}
          >
            İptal
          </Button>
          <Button
            onClick={handlePayment}
            variant="primary"
            className="flex-1"
            disabled={isProcessing || !currentAccount}
          >
            {isProcessing ? 'İşleniyor...' : `${event.price} SUI Öde`}
          </Button>
        </div>

        {!currentAccount && (
          <p className="text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
            Ödeme yapabilmek için cüzdanınızı bağlamanız gerekiyor
          </p>
        )}
      </div>
    </Modal>
  );
}
