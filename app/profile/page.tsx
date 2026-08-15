'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import QRModal from '@/components/QRModal';
import CertificateCard from '@/components/CertificateCard';
import Badge from '@/components/Badge';
import Button from '@/components/Button';

function ProfileEditForm({ user, onUpdate }: { user: any; onUpdate: (user: any) => void }) {
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    student_no: user.student_no || '',
    department: user.department || '',
    class_year: user.class_year || ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Update form data when user prop changes
  useEffect(() => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      student_no: user.student_no || '',
      department: user.department || '',
      class_year: user.class_year || ''
    });
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const token = localStorage.getItem('token');
    const isCompletingProfile = user.name === 'Yeni Kullanıcı' || !user.email;

    try {
      const res = await fetch('/api/me/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          class_year: formData.class_year ? parseInt(formData.class_year as string) : undefined
        })
      });

      const data = await res.json();

      if (res.ok) {
        if (isCompletingProfile) {
          setMessage('✅ Profil tamamlandı! Ana sayfaya yönlendiriliyorsunuz...');
        } else {
          setMessage('✅ Profil bilgileriniz güncellendi!');
        }
        onUpdate(data.user);
        
        // If this was a new user completing their profile, redirect to home
        if (isCompletingProfile) {
          setTimeout(() => {
            window.location.href = '/';
          }, 1500);
        }
      } else {
        // If unauthorized, session expired - redirect to signin
        if (res.status === 401) {
          setMessage('⚠️ Oturum süreniz dolmuş. Yönlendiriliyorsunuz...');
          setTimeout(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/auth/signin';
          }, 1500);
        } else {
          setMessage(`❌ ${data.error || 'Güncelleme başarısız'}`);
        }
      }
    } catch (error) {
      setMessage('❌ Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const isNewUser = user.name === 'Yeni Kullanıcı' || !user.email;

  return (
    <div className="max-w-2xl">
      <h2 className="font-heading font-bold text-2xl mb-2" style={{ color: 'var(--text-primary)' }}>
        {isNewUser ? '👋 Hoş Geldiniz!' : 'Profil Bilgileri'}
      </h2>
      <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
        {isNewUser ? 'Lütfen profilinizi tamamlayın - bu bilgiler etkinlik katılımlarınızda kullanılacak' : 'Kişisel bilgilerinizi güncelleyin'}
      </p>

      {message && (
        <div className={`mb-6 p-4 rounded-xl ${message.includes('✅') ? 'bg-green-50' : 'bg-red-50'}`}>
          <p className={message.includes('✅') ? 'text-green-600' : 'text-red-600'}>{message}</p>
        </div>
      )}

      <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--text-primary)' }}>ℹ️ Bilgi:</strong> Profil bilgilerinizi güncellerken "Giriş yapmanız gerekiyor" hatası alırsanız, sayfayı yenilediğinizde otomatik olarak giriş sayfasına yönlendirileceksiniz. Tekrar cüzdan ile giriş yapmanız yeterli olacaktır.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Ad Soyad *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Adınız ve soyadınız"
              className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
              style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              E-posta *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="ornek@email.com"
              className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
              style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Öğrenci No
            </label>
            <input
              type="text"
              value={formData.student_no}
              onChange={(e) => setFormData({ ...formData, student_no: e.target.value })}
              placeholder="2020123456"
              className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
              style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Bölüm
            </label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              placeholder="Bilgisayar Mühendisliği"
              className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
              style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Sınıf
            </label>
            <input
              type="number"
              value={formData.class_year}
              onChange={(e) => setFormData({ ...formData, class_year: e.target.value })}
              placeholder="1-4"
              min="1"
              max="4"
              className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
              style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
            />
          </div>
        </div>

        <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>💡 Not:</strong> Cüzdan adresiniz: <code className="px-2 py-1 rounded" style={{ backgroundColor: 'var(--bg-primary)' }}>{user.walletAddress?.slice(0, 10)}...{user.walletAddress?.slice(-8)}</code>
          </p>
        </div>

        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? (isNewUser ? 'Tamamlanıyor...' : 'Güncelleniyor...') : (isNewUser ? '✓ Profili Tamamla' : 'Profili Güncelle')}
        </Button>
      </form>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('tickets');
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/auth/signin');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    // Check if redirected to complete profile
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('complete') === 'true' && (parsedUser.name === 'Yeni Kullanıcı' || !parsedUser.email)) {
      setActiveTab('profile');
    }

    // Fetch registrations
    fetch('/api/me/registrations', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 401) {
          // Session expired - redirect to signin
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/auth/signin');
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data && Array.isArray(data)) {
          setRegistrations(data);
        }
      })
      .catch(() => setRegistrations([]));

    // Fetch certificates
    fetch('/api/me/certificates', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 401) {
          // Session expired - redirect to signin
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/auth/signin');
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data && Array.isArray(data)) {
          setCertificates(data);
        }
      })
      .catch(() => setCertificates([]));

    // Fetch profile to get updated wallet info
    fetch('/api/me/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.user) {
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
          if (data.user.wallets && data.user.wallets.length > 0) {
            setWallets(data.user.wallets);
          }
        }
      })
      .catch(err => console.error('Profile fetch error:', err));
  }, [router]);

  if (!user) return null;

  const isProfileIncomplete = !user.email || user.name === 'Yeni Kullanıcı';

  return (
    <>
      <main className="flex-1 py-12 px-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="max-w-container mx-auto">
          <div className="rounded-2xl shadow-sm p-8 mb-8" style={{ background: 'linear-gradient(135deg, rgba(250, 158, 15, 0.15), rgba(3, 70, 185, 0.15))', border: '2px solid var(--border-primary)' }}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="font-heading font-bold text-3xl mb-3" style={{ color: 'var(--text-primary)' }}>
                  {user.name === 'Yeni Kullanıcı' ? '👋 Hoş Geldiniz!' : `Hoş geldin, ${user.name}!`}
                </h1>
                
                <div className="space-y-2">
                  {wallets.length > 0 && wallets.find((w: any) => w.is_primary) && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>🔑 Ana Cüzdan:</span>
                      <code className="px-3 py-1 rounded-lg text-sm font-mono" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                        {wallets.find((w: any) => w.is_primary)?.address.slice(0, 10)}...{wallets.find((w: any) => w.is_primary)?.address.slice(-8)}
                      </code>
                      <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}>
                        {wallets.find((w: any) => w.is_primary)?.wallet_type}
                      </span>
                    </div>
                  )}
                  
                  {user.email && !user.email.includes('@temp.com') && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>📧 Email:</span>
                      <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{user.email}</span>
                    </div>
                  )}
                  
                  {user.student_no && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>🎓 Öğrenci:</span>
                      <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                        {user.student_no} • {user.department} • {user.class_year}. Sınıf
                      </span>
                    </div>
                  )}
                  
                  {user.role === 'admin' && (
                    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold mt-2" style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}>
                      ⭐ Admin
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {isProfileIncomplete && activeTab !== 'profile' && (
            <div className="rounded-xl p-6 mb-8" style={{ backgroundColor: 'rgba(250, 158, 15, 0.1)', border: '2px solid var(--accent-primary)' }}>
              <h3 className="font-semibold text-lg mb-2" style={{ color: 'var(--accent-primary)' }}>
                ⚠️ Profil Bilgilerinizi Tamamlayın
              </h3>
              <p className="mb-4" style={{ color: 'var(--text-primary)' }}>
                Ad, soyad ve e-posta gibi bilgilerinizi doldurarak profilinizi tamamlayın. Etkinliklere katılabilmek için bu bilgilerin doldurulması önemlidir.
              </p>
              <button
                onClick={() => setActiveTab('profile')}
                className="px-6 py-2 rounded-lg font-medium hover:opacity-90 transition"
                style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}
              >
                Profili Tamamla →
              </button>
            </div>
          )}

          <div className="rounded-2xl shadow-sm" style={{ backgroundColor: 'var(--bg-primary)', border: '2px solid var(--border-primary)' }}>
            <div style={{ borderBottom: '2px solid var(--border-primary)' }}>
              <div className="flex space-x-8 px-8">
                <button
                  onClick={() => setActiveTab('tickets')}
                  className="py-4 font-medium border-b-2 transition"
                  style={{
                    borderColor: activeTab === 'tickets' ? 'var(--accent-primary)' : 'transparent',
                    color: activeTab === 'tickets' ? 'var(--accent-primary)' : 'var(--text-secondary)'
                  }}
                >
                  Biletlerim ({registrations.length})
                </button>
                <button
                  onClick={() => setActiveTab('certificates')}
                  className="py-4 font-medium border-b-2 transition"
                  style={{
                    borderColor: activeTab === 'certificates' ? 'var(--accent-primary)' : 'transparent',
                    color: activeTab === 'certificates' ? 'var(--accent-primary)' : 'var(--text-secondary)'
                  }}
                >
                  Sertifikalarım ({certificates.length})
                </button>
                <button
                  onClick={() => setActiveTab('wallet')}
                  className="py-4 font-medium border-b-2 transition"
                  style={{
                    borderColor: activeTab === 'wallet' ? 'var(--accent-primary)' : 'transparent',
                    color: activeTab === 'wallet' ? 'var(--accent-primary)' : 'var(--text-secondary)'
                  }}
                >
                  Cüzdan
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className="py-4 font-medium border-b-2 transition"
                  style={{
                    borderColor: activeTab === 'profile' ? 'var(--accent-primary)' : 'transparent',
                    color: activeTab === 'profile' ? 'var(--accent-primary)' : 'var(--text-secondary)'
                  }}
                >
                  Profil Bilgileri
                </button>
              </div>
            </div>

            <div className="p-8">
              {activeTab === 'tickets' && (
                <div>
                  {registrations.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>Henüz biletiniz yok.</p>
                      <a href="/events" className="hover:underline" style={{ color: 'var(--accent-primary)' }}>
                        Etkinliklere göz atın →
                      </a>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {registrations.map((reg: any) => (
                        <div key={reg.id} className="rounded-xl p-6 transition-all" style={{ backgroundColor: 'var(--bg-secondary)', border: '2px solid var(--border-primary)' }}>
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="font-semibold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>
                                {reg.event?.title}
                              </h3>
                              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                {new Date(reg.event?.start_at).toLocaleDateString('tr-TR', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                            <Badge variant={reg.status === 'confirmed' ? 'success' : 'warning'}>
                              {reg.status === 'confirmed' ? 'Onaylandı' : 'Bekleme Listesi'}
                            </Badge>
                          </div>
                          
                          <p className="text-sm font-medium mb-4" style={{ color: 'var(--text-secondary)' }}>
                            📍 {reg.event?.location}
                          </p>

                          {reg.status === 'confirmed' && (
                            <button
                              onClick={() => setSelectedTicket(reg)}
                              className="w-full py-2 bg-primary text-white rounded-xl hover:opacity-90 transition"
                            >
                              QR Bilet Göster
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'certificates' && (
                <div>
                  {certificates.length === 0 ? (
                    <div className="text-center py-12">
                      <p style={{ color: 'var(--text-secondary)' }}>Henüz sertifikanız bulunmuyor.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {certificates.map((cert: any) => (
                        <CertificateCard
                          key={cert.id}
                          certificate={cert}
                          userName={user.name}
                          onVerify={() => router.push(`/verify?certificate_no=${cert.certificate_no}`)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'wallet' && (
                <div>
                  <div className="max-w-2xl">
                    <h2 className="font-heading font-bold text-2xl mb-4" style={{ color: 'var(--text-primary)' }}>
                      Blockchain Cüzdanı
                    </h2>
                    <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
                      Hesabınıza bağlı blockchain cüzdanınızı görüntüleyin. Her hesap bir cüzdan ile ilişkilendirilmiştir.
                    </p>

                    <div className="rounded-xl p-6 mb-6" style={{ background: 'linear-gradient(135deg, rgba(250, 158, 15, 0.1), rgba(3, 70, 185, 0.1))', border: '2px solid var(--border-primary)' }}>
                      <h3 className="font-semibold text-lg mb-3" style={{ color: 'var(--text-primary)' }}>✨ Cüzdan Özellikleri</h3>
                      <ul className="space-y-2" style={{ color: 'var(--text-primary)' }}>
                        <li className="flex items-center gap-2">
                          <span style={{ color: 'var(--accent-primary)' }}>✓</span>
                          <span>Ücretli etkinliklere katılım</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span style={{ color: 'var(--accent-primary)' }}>✓</span>
                          <span>Blockchain üzerinde ödeme yapabilme</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span style={{ color: 'var(--accent-primary)' }}>✓</span>
                          <span>NFT sertifikalarınızı cüzdanınızda saklama</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span style={{ color: 'var(--accent-primary)' }}>✓</span>
                          <span>Güvenli ve şeffaf işlem geçmişi</span>
                        </li>
                      </ul>
                    </div>

                    {wallets.length > 0 && wallets[0] ? (
                      <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--bg-secondary)', border: '2px solid var(--accent-primary)' }}>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
                                {wallets[0].wallet_type}
                              </h3>
                              <span className="text-xs px-2 py-1 rounded-full font-semibold" style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}>
                                Aktif Cüzdan
                              </span>
                            </div>
                            <p className="font-mono text-sm break-all mb-2" style={{ color: 'var(--text-secondary)' }}>
                              {wallets[0].address}
                            </p>
                            <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
                              Bağlanma: {new Date(wallets[0].connected_at).toLocaleDateString('tr-TR', { 
                                day: 'numeric', 
                                month: 'long', 
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                            <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--bg-primary)' }}>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <p className="text-xs font-semibold" style={{ color: '#22c55e' }}>Cüzdan Bağlı ve Aktif</p>
                              </div>
                              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                                Bu cüzdan hesabınızla kalıcı olarak ilişkilendirilmiştir. Tüm blockchain işlemleri bu cüzdan üzerinden gerçekleştirilir.
                              </p>
                            </div>
                          </div>
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
                            <svg className="w-6 h-6" style={{ color: '#22c55e' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-lg p-6 text-center" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                        <div className="text-4xl mb-3">🔐</div>
                        <p className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Cüzdan Bağlantısı Gerekli</p>
                        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                          Cüzdan özelliklerini kullanabilmek için lütfen çıkış yapıp tekrar giriş yapın.
                        </p>
                        <button
                          onClick={() => {
                            localStorage.removeItem('token');
                            localStorage.removeItem('user');
                            window.location.href = '/auth/signin';
                          }}
                          className="px-6 py-2 rounded-lg font-medium"
                          style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}
                        >
                          Tekrar Giriş Yap
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'profile' && (
                <ProfileEditForm user={user} onUpdate={(updatedUser) => {
                  setUser(updatedUser);
                  localStorage.setItem('user', JSON.stringify(updatedUser));
                }} />
              )}
            </div>
          </div>
        </div>
      </main>

      {selectedTicket && (
        <QRModal
          isOpen={true}
          onClose={() => setSelectedTicket(null)}
          ticket={selectedTicket}
        />
      )}
    </>
  );
}
