import './globals.css'
import './wallet.css'
import '@mysten/dapp-kit/dist/index.css'
import type { Metadata } from 'next'
import { LayoutContent } from '@/components/LayoutContent'

export const metadata: Metadata = {
  title: 'IT&MIS Kulübü - Proof of Presence',
  description: 'Web3 Event Platform with Blockchain-Verifiable Certificates',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body>
        <LayoutContent>{children}</LayoutContent>
      </body>
    </html>
  )
}
