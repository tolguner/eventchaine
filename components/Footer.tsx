import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-20" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', borderTop: '1px solid var(--border-primary)' }}>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              {/* Tech Circuit Icon */}
              <svg 
                className="h-8 w-8" 
                style={{ color: 'var(--accent-primary)' }}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <rect x="4" y="4" width="16" height="16" rx="2" />
                <rect x="9" y="9" width="6" height="6" />
                <line x1="9" y1="1" x2="9" y2="4" />
                <line x1="15" y1="1" x2="15" y2="4" />
                <line x1="9" y1="20" x2="9" y2="23" />
                <line x1="15" y1="20" x2="15" y2="23" />
                <line x1="20" y1="9" x2="23" y2="9" />
                <line x1="20" y1="14" x2="23" y2="14" />
                <line x1="1" y1="9" x2="4" y2="9" />
                <line x1="1" y1="14" x2="4" y2="14" />
              </svg>
              <span className="font-bold text-xl" style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                IT&MIS Kulübü
              </span>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              Blockchain üzerinde doğrulanabilir etkinlik katılım sertifikaları.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Hızlı Linkler</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/events" className="hover:underline transition" style={{ color: 'var(--text-secondary)' }}>Etkinlikler</Link></li>
              <li><Link href="/blog" className="hover:underline transition" style={{ color: 'var(--text-secondary)' }}>Blog</Link></li>
              <li><Link href="/about" className="hover:underline transition" style={{ color: 'var(--text-secondary)' }}>Hakkımızda</Link></li>
              <li><Link href="/contact" className="hover:underline transition" style={{ color: 'var(--text-secondary)' }}>İletişim</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Platform</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/auth/signin" className="hover:underline transition" style={{ color: 'var(--text-secondary)' }}>Cüzdan ile Giriş</Link></li>
              <li><Link href="/profile" className="hover:underline transition" style={{ color: 'var(--text-secondary)' }}>Profilim</Link></li>
              <li><Link href="/verify" className="hover:underline transition" style={{ color: 'var(--text-secondary)' }}>Sertifika Doğrula</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>İletişim</h3>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <li>FMV Işık Üniversitesi</li>
              <li>Şile, İstanbul</li>
              <li>info@itmisclub.com</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 text-center text-sm" style={{ borderTop: '1px solid var(--border-primary)', color: 'var(--text-tertiary)' }}>
          <p>&copy; 2025 IT&MIS Kulübü. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
}
