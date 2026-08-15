'use client';

import { ThemeProvider } from '@/contexts/ThemeContext'
import { WalletProviderWrapper } from '@/contexts/WalletContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export function LayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <WalletProviderWrapper>
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </WalletProviderWrapper>
    </ThemeProvider>
  )
}
