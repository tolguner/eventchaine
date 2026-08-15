'use client';

import { useState, useEffect } from 'react';
import Button from './Button';
import { Modal } from './Modal';

interface WalletConnectProps {
  onConnect?: (address: string) => void;
  onDisconnect?: () => void;
}

export default function WalletConnect({ onConnect, onDisconnect }: WalletConnectProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      if (user.wallet_address) {
        setIsConnected(true);
        setWalletAddress(user.wallet_address);
      }
    }
  }, []);

  const connectWallet = async () => {
    setLoading(true);
    setMessage('');

    try {
      // Check if user is logged in
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('Lütfen önce giriş yapın');
        setLoading(false);
        return;
      }

      // Simulated wallet address generation (Demo mode)
      const simulatedAddress = '0x' + Array.from({ length: 40 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('');
      
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Connect wallet to backend
      const res = await fetch('/api/wallet/connect', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ wallet_address: simulatedAddress }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || 'Bağlantı başarısız');
        setLoading(false);
        return;
      }

      // Update local user data
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        user.wallet_address = simulatedAddress;
        user.wallet_connected_at = data.connected_at;
        localStorage.setItem('user', JSON.stringify(user));
      }

      setIsConnected(true);
      setWalletAddress(simulatedAddress);
      setShowModal(false);
      setMessage('');
      
      if (onConnect) {
        onConnect(simulatedAddress);
      }
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      setMessage('Bağlantı sırasında bir hata oluştu');
    }
    
    setLoading(false);
  };

  const disconnectWallet = async () => {
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/wallet/connect', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        // Update local user data
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          delete user.wallet_address;
          delete user.wallet_connected_at;
          localStorage.setItem('user', JSON.stringify(user));
        }

        setIsConnected(false);
        setWalletAddress('');
        
        if (onDisconnect) {
          onDisconnect();
        }
      }
    } catch (error) {
      console.error('Disconnect error:', error);
    }
    
    setLoading(false);
  };

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <>
      {isConnected ? (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-700">
              {formatAddress(walletAddress)}
            </span>
          </div>
          <Button
            variant="secondary"
            onClick={disconnectWallet}
            disabled={loading}
            className="text-sm"
          >
            {loading ? 'Bağlantı Kesiliyor...' : 'Bağlantıyı Kes'}
          </Button>
        </div>
      ) : (
        <Button
          variant="primary"
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          Cüzdan Bağla
        </Button>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-heading font-bold text-text">
              Cüzdan Bağla
            </h2>
            <button
              onClick={() => setShowModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              Etkinliklere katılmak ve ödeme yapmak için blockchain cüzdanınızı bağlayın.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-blue-700">
                  <p className="font-semibold mb-1">Demo Modu</p>
                  <p>Bu bir demo uygulamasıdır. Cüzdan adresi otomatik olarak simüle edilecektir.</p>
                </div>
              </div>
            </div>
          </div>

          {message && (
            <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {message}
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={connectWallet}
              disabled={loading}
              className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-primary hover:bg-primary/5 transition group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.05 12.95l-4.55-4.55-1.41 1.41 3.13 3.14H4.77l3.13-3.14-1.41-1.41-4.55 4.55a1 1 0 000 1.41l4.55 4.55 1.41-1.41-3.13-3.14h14.45l-3.13 3.14 1.41 1.41 4.55-4.55a1 1 0 000-1.41z"/>
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-text group-hover:text-primary transition">
                    Simüle Cüzdan
                  </p>
                  <p className="text-sm text-gray-500">
                    {loading ? 'Bağlanıyor...' : 'Demo cüzdan bağla'}
                  </p>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-primary transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Demo modunda rastgele bir cüzdan adresi oluşturulur. Gerçek blockchain işlemi yapılmaz.
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}

// TypeScript declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}
