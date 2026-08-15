'use client';

import { ConnectButton, useCurrentAccount, useDisconnectWallet, useSignPersonalMessage, useCurrentWallet } from '@mysten/dapp-kit';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Button from './Button';

export default function WalletAuth() {
  const currentAccount = useCurrentAccount();
  const currentWallet = useCurrentWallet();
  const { mutateAsync: disconnect } = useDisconnectWallet();
  const { mutateAsync: signMessage } = useSignPersonalMessage();
  const router = useRouter();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    if (currentAccount && !isAuthenticating) {
      checkAndAuthenticate();
    }
  }, [currentAccount]);

  const checkAndAuthenticate = async () => {
    if (!currentAccount) return;

    // Check if we have a token and if it matches current wallet
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      const user = JSON.parse(userData);
      // If token exists and matches current wallet, verify it's still valid
      if (user.walletAddress === currentAccount.address) {
        // Test token validity with a quick API call
        const testResponse = await fetch('/api/me/registrations', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (testResponse.ok) {
          // Token is valid, no need to re-authenticate
          return;
        }
      }
      // Token invalid or different wallet - clear and re-authenticate
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    
    // Authenticate with wallet
    authenticateWithWallet();
  };

  const authenticateWithWallet = async () => {
    if (!currentAccount) return;
    
    setIsAuthenticating(true);
    try {
      // Detect wallet type
      const walletType = currentWallet && 'currentWallet' in currentWallet && currentWallet.currentWallet
        ? currentWallet.currentWallet.name
        : 'Unknown';
      
      // Create a message to sign
      const message = `Sign this message to authenticate with EventChain\nWallet: ${currentAccount.address}\nTimestamp: ${Date.now()}`;
      
      // Sign the message
      const { signature, bytes } = await signMessage({
        message: new TextEncoder().encode(message),
      });

      // Send to backend for verification and session creation
      const response = await fetch('/api/auth/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: currentAccount.address,
          signature,
          message: bytes,
          walletType,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        
        // Fetch full profile with wallet info
        const profileResponse = await fetch('/api/me/profile', {
          headers: { 'Authorization': `Bearer ${data.token}` }
        });
        
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          localStorage.setItem('user', JSON.stringify(profileData.user));
          
          // Check if user needs to complete profile (new user)
          const isNewUser = profileData.user.name === 'Yeni Kullanıcı' || !profileData.user.email || profileData.user.email.includes('@temp.com');
          
          if (isNewUser) {
            // Redirect to profile page with a flag to show the profile form
            window.location.href = '/profile?complete=true';
          } else {
            // Existing user with complete profile - go to home
            window.location.href = '/';
          }
        } else {
          localStorage.setItem('user', JSON.stringify(data.user));
          window.location.href = '/';
        }
      } else {
        console.error('Wallet authentication failed');
        await disconnect();
      }
    } catch (error) {
      console.error('Error during wallet authentication:', error);
      await disconnect();
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleDisconnect = async () => {
    await disconnect();
    localStorage.removeItem('token');
    router.push('/');
  };

  if (currentAccount) {
    return (
      <div className="flex items-center gap-4">
        <div className="text-sm" style={{ color: 'var(--text-primary)' }}>
          {currentAccount.address.slice(0, 6)}...{currentAccount.address.slice(-4)}
        </div>
        <Button onClick={handleDisconnect} variant="secondary">
          Çıkış Yap
        </Button>
      </div>
    );
  }

  return (
    <div className="connect-wallet-wrapper">
      <ConnectButton 
        connectText="Cüzdan Bağla"
      />
    </div>
  );
}
