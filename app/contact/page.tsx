'use client';

import { useState } from 'react';
import Button from '@/components/Button';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleChange = (field: 'name' | 'email' | 'message') =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setError('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Mesaj gönderilemedi');
        setStatus('error');
        return;
      }

      setStatus('success');
      setForm({ name: '', email: '', message: '' });
    } catch {
      setError('Sunucuya ulaşılamadı');
      setStatus('error');
    }
  };

  return (
    <main className="flex-1 py-12 px-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="max-w-4xl mx-auto">
          <h1 className="font-heading font-bold text-4xl mb-8 text-center" style={{ color: 'var(--text-primary)' }}>
            İletişim
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-2xl shadow-sm p-8" style={{ backgroundColor: 'var(--bg-primary)', border: '2px solid var(--border-primary)' }}>
              <h2 className="font-heading font-semibold text-2xl mb-6" style={{ color: 'var(--text-primary)' }}>
                Bize Ulaşın
              </h2>

              {status === 'success' ? (
                <div
                  className="rounded-xl p-4 text-center"
                  style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid #22C55E', color: '#22C55E' }}
                >
                  ✅ Mesajınız gönderildi, teşekkür ederiz!
                </div>
              ) : (
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      Ad Soyad
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={handleChange('name')}
                      className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                      style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
                      placeholder="Adınız"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      E-posta
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={handleChange('email')}
                      className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                      style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
                      placeholder="ornek@gmail.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      Mesaj
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={form.message}
                      onChange={handleChange('message')}
                      className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                      style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
                      placeholder="Mesajınızı yazın..."
                    />
                  </div>

                  {status === 'error' && (
                    <div
                      className="rounded-xl p-3 text-sm"
                      style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444', color: '#EF4444' }}
                    >
                      {error}
                    </div>
                  )}

                  <Button variant="primary" className="w-full" type="submit" disabled={status === 'loading'}>
                    {status === 'loading' ? 'Gönderiliyor...' : 'Gönder'}
                  </Button>
                </form>
              )}
            </div>

            <div>
              <div className="rounded-2xl shadow-sm p-8" style={{ background: 'linear-gradient(135deg, #fa9e0f 0%, #ff8c42 50%, #0346b9 100%)', border: '2px solid var(--border-primary)' }}>
                <h3 className="font-heading font-semibold text-xl mb-4 text-white">
                  İletişim Bilgileri
                </h3>
                <div className="space-y-3 mb-8 text-white">
                  <p>📧 itmis@isik.edu.tr</p>
                  <p>📍 Işık Üniversitesi, Şile, İstanbul</p>
                  <p>🌐 itmis.isikun.edu.tr</p>
                </div>

                <div className="pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.3)' }}>
                  <h3 className="font-heading font-semibold text-xl mb-3 text-white">
                    Sosyal Medya
                  </h3>
                  <p className="text-lg font-semibold mb-4 text-white">
                    @isikitmis
                  </p>
                  <div className="flex gap-4 flex-wrap">
                    <a
                      href="https://instagram.com/isikitmis"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg"
                      style={{ backgroundColor: '#E4405F' }}
                      title="Instagram"
                    >
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </a>
                    <a
                      href="https://twitter.com/isikitmis"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg"
                      style={{ backgroundColor: '#1DA1F2' }}
                      title="Twitter"
                    >
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                    </a>
                    <a
                      href="https://tiktok.com/@isikitmis"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg"
                      style={{ backgroundColor: '#000000' }}
                      title="TikTok"
                    >
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                      </svg>
                    </a>
                    <a
                      href="https://youtube.com/@isikitmis"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg"
                      style={{ backgroundColor: '#FF0000' }}
                      title="YouTube"
                    >
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    </a>
                    <a
                      href="https://linkedin.com/company/isikitmis"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg"
                      style={{ backgroundColor: '#0A66C2' }}
                      title="LinkedIn"
                    >
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
  );
}
