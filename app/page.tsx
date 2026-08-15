'use client';

import { useEffect, useState } from 'react';
import EventCard from '@/components/EventCard';
import BlogCard from '@/components/BlogCard';
import Button from '@/components/Button';
import Link from 'next/link';

export default function HomePage() {
  const [events, setEvents] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total_users: 0,
    completed_events: 0,
    total_certificates: 0,
    total_checkins: 0,
    total_registrations: 0,
  });

  useEffect(() => {
    fetch('/api/events')
      .then(res => res.json())
      .then(data => setEvents(data.slice(0, 3)));

    fetch('/api/posts')
      .then(res => res.json())
      .then(data => setBlogs(data.slice(0, 3)));

    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => {});
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="text-white py-24 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #fa9e0f 0%, #ff8c42 50%, #0346b9 100%)' }}>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
          </div>
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="max-w-3xl">
              <h1 className="font-bold text-6xl mb-6 leading-tight animate-fade-in">
                Etkinliklere ön kayıt ol, QR ile check-in yap, blockchain sertifikası al
              </h1>
              <p className="text-xl mb-8 text-white/95 leading-relaxed">
                IT&MIS Club etkinliklerine katıl, zincirde doğrulanabilir Proof of Presence sertifikası kazan.
              </p>
              <div className="flex gap-4 flex-wrap">
                <Link href="/events">
                  <Button variant="primary" className="bg-white !text-primary hover:scale-110 shadow-xl" style={{ background: 'white', color: '#fa9e0f' }}>
                    Etkinlikleri Keşfet
                  </Button>
                </Link>
                <Link href="/about">
                  <Button variant="outline" className="border-2 border-white text-white hover:bg-white hover:!text-primary" style={{ borderColor: 'white', backgroundColor: 'transparent', color: 'white' }}>
                    Nasıl Çalışır?
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="p-6 rounded-xl transition-transform hover:scale-105" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <div className="text-5xl font-bold mb-2" style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  {stats.total_users || 0}{stats.total_users > 0 ? '+' : ''}
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>Toplam Katılımcı</div>
              </div>
              <div className="p-6 rounded-xl transition-transform hover:scale-105" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <div className="text-5xl font-bold mb-2" style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  {stats.completed_events || 0}
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>Tamamlanan Etkinlik</div>
              </div>
              <div className="p-6 rounded-xl transition-transform hover:scale-105" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <div className="text-5xl font-bold mb-2" style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  {stats.total_certificates || 0}
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>Dağıtılan Sertifika</div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20" style={{ backgroundColor: 'var(--bg-primary)' }}>
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="font-bold text-4xl text-center mb-16" style={{ color: 'var(--text-primary)' }}>
              Nasıl Çalışır?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="text-center p-8 rounded-2xl transition-all hover:scale-105" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6 shadow-lg" style={{ background: 'var(--accent-gradient)' }}>
                  1
                </div>
                <h3 className="font-semibold text-2xl mb-3" style={{ color: 'var(--text-primary)' }}>Ön Kayıt</h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Etkinliğe ön kayıt ol, QR biletini profil sayfandan al
                </p>
              </div>
              <div className="text-center p-8 rounded-2xl transition-all hover:scale-105" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6 shadow-lg" style={{ background: 'linear-gradient(135deg, #0346b9, #0557d9)' }}>
                  2
                </div>
                <h3 className="font-semibold text-2xl mb-3" style={{ color: 'var(--text-primary)' }}>QR Check-in</h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Etkinlik girişinde QR kodunu organizatöre göster
                </p>
              </div>
              <div className="text-center p-8 rounded-2xl transition-all hover:scale-105" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6 shadow-lg" style={{ background: 'var(--accent-gradient)' }}>
                  3
                </div>
                <h3 className="font-semibold text-2xl mb-3" style={{ color: 'var(--text-primary)' }}>Sertifika</h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Blockchain üzerinde doğrulanabilir katılım sertifikası al
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Upcoming Events */}
        <section className="py-20" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between mb-12">
              <h2 className="font-bold text-4xl" style={{ color: 'var(--text-primary)' }}>
                Yaklaşan Etkinlikler
              </h2>
              <Link href="/events" className="text-lg font-semibold hover:underline transition-colors" style={{ color: 'var(--accent-primary)' }}>
                Tümünü Gör →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {events.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        </section>

        {/* Blog Section */}
        <section className="py-20" style={{ backgroundColor: 'var(--bg-primary)' }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between mb-12">
              <h2 className="font-bold text-4xl" style={{ color: 'var(--text-primary)' }}>
                Son Blog Yazıları
              </h2>
              <Link href="/blog" className="text-lg font-semibold hover:underline transition-colors" style={{ color: 'var(--accent-primary)' }}>
                Tümünü Gör →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {blogs.map(blog => (
                <BlogCard key={blog.id} post={blog} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0346b9 0%, #0557d9 50%, #7c3aed 100%)' }}>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
          </div>
          <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
            <h2 className="font-bold text-5xl mb-6">
              Hemen Başla
            </h2>
            <p className="text-xl mb-10 text-white/95 max-w-2xl mx-auto">
              Cüzdanını bağla, etkinliklere katıl, blockchain sertifikalarını topla
            </p>
            <Link href="/auth/signin">
              <Button variant="primary" className="bg-white !text-blue-600 hover:scale-110 shadow-2xl text-lg px-10 py-4" style={{ background: 'white', color: '#0346b9' }}>
                🔐 Cüzdan ile Giriş
              </Button>
            </Link>
          </div>
        </section>
    </>
  );
}
