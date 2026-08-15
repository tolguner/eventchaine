'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import { Modal } from '@/components/Modal';
import { PaymentModal } from '@/components/PaymentModal';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      
      // Check if already registered
      fetch('/api/me/registrations', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const registered = data.some((r: any) => r.event?.slug === params.slug);
            setIsRegistered(registered);
          }
        })
        .catch(() => {})
        .finally(() => setCheckingAuth(false));
    } else {
      setCheckingAuth(false);
    }

    fetch(`/api/events/${params.slug}`)
      .then(res => res.json())
      .then(data => setEvent(data));
  }, [params.slug]);

  const initiateRegistration = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      setMessage('Lütfen önce giriş yapın');
      setTimeout(() => router.push('/auth/signin'), 1500);
      return;
    }

    const currentUser = JSON.parse(userData);

    // Check if event is paid
    if (event.price > 0 && event.currency !== 'FREE') {
      // Check wallet connection
      if (!currentUser.walletAddress) {
        setMessage('❌ Ücretli etkinliklere katılmak için cüzdan ile giriş yapmalısınız');
        return;
      }
      setShowPaymentModal(true);
    } else {
      // Free event - direct registration
      handleRegister();
    }
  };

  const handlePaymentSuccess = async (txHash: string) => {
    setMessage('✅ Ödeme başarılı! Kaydınız yapılıyor...');
    await handleRegister(txHash);
  };

  const handleRegister = async (paymentTxHash?: string) => {
    const token = localStorage.getItem('token');
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch(`/api/events/${event.id}/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_tx_hash: paymentTxHash,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // If unauthorized, clear localStorage and redirect to signin
        if (res.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setMessage('⚠️ Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
          setTimeout(() => router.push('/auth/signin'), 2000);
        } else {
          setMessage(data.error || 'Kayıt başarısız');
        }
      } else {
        setMessage('✅ Kayıt başarılı! Biletinizi Profil sayfasından görebilirsiniz.');
        setIsRegistered(true);
        setTimeout(() => router.push('/profile'), 2000);
      }
    } catch (err) {
      setMessage('❌ Bir hata oluştu. Lütfen tekrar deneyin.');
    }
    setLoading(false);
  };

  if (!event || checkingAuth) {
    return (
      <main className="flex-1 flex items-center justify-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p style={{ color: 'var(--text-secondary)' }}>Yüklüyor...</p>
        </div>
      </main>
    );
  }

  const date = new Date(event.start_at);
  const endDate = new Date(event.end_at);
  const isFull = (event.current_registrations || 0) >= event.capacity;
  const remainingSeats = event.capacity - (event.current_registrations || 0);

  return (
    <>
      <main className="flex-1" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        {/* Hero Image */}
        <div className="relative bg-gradient-to-br from-primary to-secondary h-96 overflow-hidden">
          <Image
            src={event.cover_url}
            alt={event.title}
            fill
            className="object-cover opacity-90"
            unoptimized
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </div>
        
        <div className="max-w-container mx-auto px-6 -mt-32 pb-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl shadow-xl p-8 mb-8 relative" style={{ backgroundColor: 'var(--bg-primary)' }}>
                <div className="flex flex-wrap gap-2 mb-6">
                  {event.tags.map((tag: string) => (
                    <Badge key={tag} variant="primary">{tag}</Badge>
                  ))}
                </div>

                <h1 className="font-heading font-bold text-4xl lg:text-5xl mb-6" style={{ color: 'var(--text-primary)' }}>
                  {event.title}
                </h1>

                <div className="flex items-center gap-4 mb-8 pb-8" style={{ borderBottom: '1px solid var(--border-primary)' }}>
                  <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-sm">IT&MIS Kulübü</span>
                  </div>
                  <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span className="text-sm">{event.current_registrations || 0} kişi kayıtlı</span>
                  </div>
                </div>

                <h2 className="font-heading font-semibold text-2xl mb-4" style={{ color: 'var(--text-primary)' }}>
                  Etkinlik Hakkında
                </h2>
                <p className="text-lg leading-relaxed mb-8" style={{ color: 'var(--text-secondary)' }}>
                  {event.description}
                </p>

                <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl p-6 mb-8">
                  <h3 className="font-semibold text-lg mb-3" style={{ color: 'var(--text-primary)' }}>🎁 Katılımcılara Özel</h3>
                  <ul className="space-y-2" style={{ color: 'var(--text-secondary)' }}>
                    <li className="flex items-center gap-2">
                      <span className="text-primary">✓</span>
                      <span>Blockchain üzerinde Soulbound NFT sertifikası</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary">✓</span>
                      <span>Dijital katılım rozetleri</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary">✓</span>
                      <span>Networking fırsatı</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary">✓</span>
                      <span>Etkinlik sonrası sunum materyalleri</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-6" style={{ borderTop: '1px solid var(--border-primary)' }}>
                  <h3 className="font-semibold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>📋 Katılım Şartları</h3>
                  <ul className="space-y-2" style={{ color: 'var(--text-secondary)' }}>
                    <li>• Işık Üniversitesi öğrencisi olmak</li>
                    <li>• Ön kayıt formunu doldurmak</li>
                    <li>• Check-in sırasında QR kodunu göstermek</li>
                    <li>• Etkinlik süresince aktif katılım göstermek</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="rounded-2xl shadow-xl p-6 sticky top-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
                <h3 className="font-heading font-semibold text-xl mb-6" style={{ color: 'var(--text-primary)' }}>
                  Etkinlik Detayları
                </h3>

                <div className="space-y-5 mb-8">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm mb-1" style={{ color: 'var(--text-tertiary)' }}>Başlangıç</p>
                      <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm mb-1" style={{ color: 'var(--text-tertiary)' }}>Bitiş</p>
                      <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {endDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                      </p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {endDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm mb-1" style={{ color: 'var(--text-tertiary)' }}>Konum</p>
                      <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{event.location}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm mb-1" style={{ color: 'var(--text-tertiary)' }}>Kapasite</p>
                      <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{event.capacity} kişi</p>
                      <p className={`text-sm ${isFull ? 'text-red-600' : 'text-green-600'}`}>
                        {isFull ? 'Dolu' : `${remainingSeats} kişi kaldı`}
                      </p>
                    </div>
                  </div>
                </div>

                {message && (
                  <div className={`mb-6 p-4 rounded-xl text-sm ${
                    message.includes('✅') 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {message}
                  </div>
                )}

                {isRegistered ? (
                  <div className="bg-green-50 border-2 border-green-500 rounded-xl p-4 text-center">
                    <svg className="w-12 h-12 text-green-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="font-semibold text-green-700">Kayıt Tamamlandı!</p>
                    <p className="text-sm text-green-600 mt-1">Bu etkinliğe kayıtlısınız</p>
                  </div>
                ) : (
                  <Button
                    onClick={initiateRegistration}
                    variant="primary"
                    disabled={loading || isFull}
                    className="w-full text-lg py-4"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Kaydediliyor...
                      </span>
                    ) : isFull ? '❌ Etkinlik Dolu' : '🎫 Ön Kayıt Ol'}
                  </Button>
                )}

                {!user && !isRegistered && (
                  <p className="text-xs text-center mt-4" style={{ color: 'var(--text-tertiary)' }}>
                    Kayıt olmak için giriş yapmanız gerekiyor
                  </p>
                )}

                <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--border-primary)' }}>
                  <div className="flex items-center justify-between text-sm">
                    {event.price > 0 ? (
                      <>
                        <div>
                          <p className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>{event.price} {event.currency}</p>
                          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Blockchain ile ödeme</p>
                        </div>
                        <Badge variant="warning">Üretli</Badge>
                      </>
                    ) : (
                      <>
                        <span style={{ color: 'var(--text-secondary)' }}>Ücretsiz</span>
                        <Badge variant="success">Açık Etkinlik</Badge>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>



      {/* Sui Payment Modal */}
      {event && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          event={{
            id: event.id,
            title: event.title,
            price: event.price,
            currency: event.currency,
          }}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
}
