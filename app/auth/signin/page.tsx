'use client';

import { useRouter } from 'next/navigation';
import WalletAuth from '@/components/WalletAuth';
import Link from 'next/link';

export default function SignInPage() {
  const router = useRouter();

  return (
    <main className="flex-1 flex items-center justify-center py-12 px-6">
        <div className="max-w-md w-full">
          <div className="rounded-2xl shadow-lg p-8" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-primary)', borderWidth: '1px' }}>
            <h1 className="font-heading font-bold text-3xl mb-2 text-center" style={{ color: 'var(--text-primary)' }}>
              Cüzdan ile Giriş
            </h1>
            <p className="text-center mb-8" style={{ color: 'var(--text-secondary)' }}>
              Sui Network - Web3 Kimlik Doğrulama
            </p>

            <div className="space-y-6">
              <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>🔐 Güvenli Giriş</h3>
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                  Suiet cüzdanınızı bağlayarak platform'a güvenli bir şekilde giriş yapabilirsiniz. 
                  Blockchain tabanlı kimlik doğrulama ile verileriniz güvende.
                </p>
                <WalletAuth />
              </div>

              <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--accent-primary)', borderWidth: '1px' }}>
                <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>ℹ️ Bilgi:</p>
                <ul className="text-xs space-y-1" style={{ color: 'var(--text-secondary)' }}>
                  <li>• Suiet cüzdanı yüklü değilse otomatik olarak yönlendirileceksiniz</li>
                  <li>• İlk girişte yeni bir hesap otomatik oluşturulur</li>
                  <li>• Cüzdan adresiniz kimliğiniz olarak kullanılır</li>
                  <li>• Test için Sui Testnet ağını kullanıyoruz</li>
                </ul>
              </div>

              <div className="text-center">
                <Link href="/" className="text-sm hover:underline" style={{ color: 'var(--accent-primary)' }}>
                  ← Ana Sayfaya Dön
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
  );
}
