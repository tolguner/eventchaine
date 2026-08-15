'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import Badge from '@/components/Badge';
import QRScanner from '@/components/QRScanner';
import WalletConnect from '@/components/WalletConnect';
import { useCurrentWallet, useCurrentAccount, useSuiClient, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { mintProofOfPresenceNFT } from '@/lib/suiNFT';
import { uploadMetadataToIPFS } from '@/lib/ipfs';

export default function AdminPage() {
  const router = useRouter();
  const { currentWallet } = useCurrentWallet();
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'events' | 'blogs' | 'scanner' | 'profile'>('dashboard');
  const [events, setEvents] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [checkins, setCheckins] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  
  const [showEventModal, setShowEventModal] = useState(false);
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [editingBlog, setEditingBlog] = useState<any>(null);
  
  const [scanResult, setScanResult] = useState<any>(null);
  const [scanError, setScanError] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/auth/signin');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'admin') {
      router.push('/');
      return;
    }

    // Set initial user data
    setUser(parsedUser);

    // Fetch fresh user data with wallet info
    fetch('/api/me/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        // Admin kullanıcı için bağlı olan aktif cüzdanı kullan
        if (currentAccount) {
          setUser({
            ...data,
            wallet_address: currentAccount.address,
            wallet_type: currentWallet?.name || 'Connected Wallet',
            wallet_connected_at: new Date().toISOString()
          });
        } else if (data.wallets && data.wallets.length > 0) {
          setUser({
            ...data,
            wallet_address: data.wallets[0].address,
            wallet_type: data.wallets[0].wallet_type,
            wallet_connected_at: data.wallets[0].connected_at
          });
        } else {
          setUser(data);
        }
      })
      .catch(() => {});

    fetch('/api/events', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setEvents(data));

    fetch('/api/posts', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setBlogs(data));

    // Fetch all registrations (admin only)
    fetch('/api/admin/registrations', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRegistrations(data);
        }
      })
      .catch(err => console.error('Registrations fetch error:', err));

    // Fetch all check-ins (admin only)
    fetch('/api/admin/checkins', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCheckins(data);
        }
      })
      .catch(err => console.error('Checkins fetch error:', err));
  }, [router, currentAccount, currentWallet]);

  // Cüzdan değiştiğinde admin bilgilerini güncelle
  useEffect(() => {
    if (user && currentAccount) {
      setUser((prev: any) => ({
        ...prev,
        wallet_address: currentAccount.address,
        wallet_type: currentWallet?.name || 'Connected Wallet',
        wallet_connected_at: new Date().toISOString()
      }));
    }
  }, [currentAccount, currentWallet]);

  const handleIssueCertificates = async (eventId: string) => {
    const token = localStorage.getItem('token');
    
    // Check wallet connection
    if (!currentWallet || !currentAccount) {
      alert('⚠️ Cüzdan bağlı değil!\n\nNFT mint etmek için önce cüzdanınızı bağlamanız gerekiyor.');
      return;
    }
    
    // Confirm dialog
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    
    // Get event registrations
    const eventRegistrations = registrations.filter(r => r.event_id === eventId && r.status === 'confirmed');
    
    if (eventRegistrations.length === 0) {
      alert('❌ Bu etkinlikte onaylanmış kayıt bulunmuyor.');
      return;
    }
    
    const confirmed = window.confirm(
      `"${event.title}" etkinliği için ${eventRegistrations.length} katılımcıya NFT sertifikası dağıtılacak.\n\n` +
      `⚠️ Bu işlem blockchain'de gerçek transaction oluşturacak ve GAS ücreti gerektirecektir.\n\n` +
      `Bu işlem geri alınamaz. Devam etmek istiyor musunuz?`
    );
    
    if (!confirmed) return;
    
    try {
      // Show loading state
      const loadingMsg = document.createElement('div');
      loadingMsg.id = 'nft-loading';
      loadingMsg.className = 'fixed top-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse';
      loadingMsg.innerHTML = '🎨 NFT\'ler blockchain\'de oluşturuluyor...<br/><small>Lütfen bekleyin, işlem sürebilir</small>';
      document.body.appendChild(loadingMsg);

      // 1️⃣ Upload metadata to IPFS first
      console.log('📤 Uploading metadata to IPFS...');
      const metadata = {
        name: `${event.title} - Katılım Sertifikası`,
        description: `${event.title} etkinliğine katıldığınız için teşekkür ederiz!`,
        image: event.cover_url || '/images/events/default-certificate.jpg',
        attributes: [
          { trait_type: 'Event', value: event.title },
          { trait_type: 'Date', value: new Date(event.start_at).toLocaleDateString('tr-TR') },
          { trait_type: 'Location', value: event.location },
          { trait_type: 'Type', value: 'Proof of Presence' },
        ],
      };
      
      const ipfsUrl = await uploadMetadataToIPFS(metadata);
      const ipfsUrlString = typeof ipfsUrl === 'string' ? ipfsUrl : ipfsUrl.url;
      console.log('✅ Metadata uploaded:', ipfsUrlString);

      // 2️⃣ Mint NFTs one by one with signAndExecuteTransaction
      const results: any[] = [];
      
      for (let i = 0; i < eventRegistrations.length; i++) {
        const reg = eventRegistrations[i];
        console.log(`\n[${i + 1}/${eventRegistrations.length}] Minting for ${reg.user.name}...`);
        
        try {
          const params = {
            recipientAddress: reg.user.wallets?.[0]?.address || currentAccount.address,
            eventId: eventId,
            eventTitle: event.title,
            participantName: reg.user.name,
            eventDate: new Date(event.start_at).toLocaleDateString('tr-TR'),
            certificateNo: `EC-${eventId.slice(0, 8).toUpperCase()}-${reg.user_id.slice(0, 6).toUpperCase()}`,
            metadataUrl: ipfsUrlString,
            imageUrl: event.cover_url || '/images/events/default-certificate.jpg',
          };
          
          // Call mint function with signAndExecuteTransaction
          const result = await mintProofOfPresenceNFT(
            suiClient,
            { signAndExecuteTransaction, address: currentAccount.address },
            params
          );
          
          results.push({ ...result, userId: reg.user_id });
          
          if (result.success) {
            console.log(`✅ Success! TX: ${result.digest}`);
          } else {
            console.error(`❌ Failed: ${result.error}`);
          }
          
          // Rate limiting
          if (i < eventRegistrations.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        } catch (error: any) {
          console.error(`❌ Error:`, error);
          results.push({ success: false, error: error.message, userId: reg.user_id });
        }
      }

      console.log('✅ Batch mint completed:', results);
      
      // Remove loading message
      document.getElementById('nft-loading')?.remove();
      
      // 3️⃣ Save successful mints to database
      const successfulMints = results.filter(r => r.success);
      
      if (successfulMints.length > 0) {
        await Promise.all(
          successfulMints.map(async (result) => {
            return fetch('/api/events/auto-certificates', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                event_id: eventId,
                user_id: result.userId,
                nft_token_id: result.objectId,
                nft_tx_hash: result.txHash,
                metadata_url: ipfsUrlString,
                blockchain: 'SUI',
              }),
            });
          })
        );
        
        // Show success message
        const explorerLinks = successfulMints
          .map((r, i) => `${i + 1}. ${r.explorerUrl}`)
          .slice(0, 5)
          .join('\n');
        
        alert(
          `✅ Başarılı!\n\n` +
          `${successfulMints.length} adet NFT sertifikası blockchain'de oluşturuldu!\n\n` +
          `🔗 İlk ${Math.min(5, successfulMints.length)} transaction:\n${explorerLinks}\n\n` +
          `Katılımcılar profillerinden sertifikalarını görüntüleyebilir.`
        );
      }
      
      // Show failures
      const failedMints = results.filter(r => !r.success);
      if (failedMints.length > 0) {
        console.error('❌ Failed mints:', failedMints);
        alert(
          `⚠️ Kısmi Başarı\n\n` +
          `${successfulMints.length} başarılı, ${failedMints.length} başarısız\n\n` +
          `Hataları console'da görebilirsiniz.`
        );
      }
      
    } catch (err) {
      document.getElementById('nft-loading')?.remove();
      console.error('Certificate issue error:', err);
      alert(
        `❌ Blockchain işlemi başarısız!\n\n` +
        `Hata: ${err instanceof Error ? err.message : 'Bilinmeyen hata'}\n\n` +
        `Detaylar için console'u kontrol edin.`
      );
    }
  };

  const handleCreateEvent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (editingEvent) {
      // Düzenleme modu
      const updatedEvent = {
        ...editingEvent,
        title: formData.get('title'),
        slug: (formData.get('title') as string).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        description: formData.get('description'),
        start_at: formData.get('start_at'),
        end_at: formData.get('end_at'),
        location: formData.get('location'),
        capacity: parseInt(formData.get('capacity') as string),
        price: parseFloat(formData.get('price') as string) || 0,
        currency: formData.get('currency') || 'FREE',
        tags: (formData.get('tags') as string).split(',').map(t => t.trim()),
        cover_url: formData.get('cover_url'),
      };
      setEvents(events.map(e => e.id === editingEvent.id ? updatedEvent : e));
      alert('Etkinlik başarıyla güncellendi!');
    } else {
      // Yeni oluşturma modu
      const newEvent = {
        id: `e_${Date.now()}`,
        title: formData.get('title'),
        slug: (formData.get('title') as string).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        description: formData.get('description'),
        start_at: formData.get('start_at'),
        end_at: formData.get('end_at'),
        location: formData.get('location'),
        capacity: parseInt(formData.get('capacity') as string),
        price: parseFloat(formData.get('price') as string) || 0,
        currency: formData.get('currency') || 'FREE',
        tags: (formData.get('tags') as string).split(',').map(t => t.trim()),
        cover_url: formData.get('cover_url'),
        created_by: user.id,
        is_published: true,
      };
      setEvents([...events, newEvent]);
      alert('Etkinlik başarıyla oluşturuldu!');
    }
    
    setShowEventModal(false);
    setEditingEvent(null);
  };

  const handleCreateBlog = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (editingBlog) {
      // Düzenleme modu
      const updatedBlog = {
        ...editingBlog,
        title: formData.get('title'),
        slug: (formData.get('title') as string).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        excerpt: formData.get('excerpt'),
        content: formData.get('content'),
        cover_url: formData.get('cover_url'),
        category: formData.get('category'),
        author: formData.get('author') || user.name,
        // views değerini koruyoruz, müdahale etmiyoruz
      };
      setBlogs(blogs.map(b => b.id === editingBlog.id ? updatedBlog : b));
      alert('Blog yazısı başarıyla güncellendi!');
    } else {
      // Yeni oluşturma modu
      const newBlog = {
        id: `b_${Date.now()}`,
        title: formData.get('title'),
        slug: (formData.get('title') as string).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        excerpt: formData.get('excerpt'),
        content: formData.get('content'),
        cover_url: formData.get('cover_url'),
        category: formData.get('category'),
        created_at: new Date().toISOString(),
        author: formData.get('author') || user.name,
        views: 0,
      };
      setBlogs([...blogs, newBlog]);
      alert('Blog yazısı başarıyla oluşturuldu!');
    }
    
    setShowBlogModal(false);
    setEditingBlog(null);
  };

  const handleDeleteEvent = (eventId: string) => {
    if (confirm('Bu etkinliği silmek istediğinizden emin misiniz?')) {
      setEvents(events.filter(e => e.id !== eventId));
      alert('Etkinlik silindi!');
    }
  };

  const handleDeleteBlog = (blogId: string) => {
    if (confirm('Bu blog yazısını silmek istediğinizden emin misiniz?')) {
      setBlogs(blogs.filter(b => b.id !== blogId));
      alert('Blog yazısı silindi!');
    }
  };

  return (
    <>
      <main className="flex-1 py-12 px-6">
        <div className="max-w-container mx-auto">
          {user && (
          <>
          {/* Admin Profile Header */}
          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/20 rounded-2xl shadow-sm p-8 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-heading font-bold text-3xl mb-2" style={{ color: 'var(--text-primary)' }}>
                  Admin Panel - Hoş geldin, {user?.name || 'Admin'}!
                </h1>
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{user?.email || ''}</p>
                <Badge variant="success" className="mt-2">Administrator</Badge>
              </div>
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {user?.name?.charAt(0) || 'A'}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="rounded-2xl shadow-sm border-2 mb-8" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-primary)' }}>
            <div style={{ borderBottom: '2px solid var(--border-primary)' }}>
              <div className="flex space-x-8 px-8 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="py-4 font-medium border-b-2 transition whitespace-nowrap"
                  style={{
                    borderColor: activeTab === 'dashboard' ? 'var(--accent-primary)' : 'transparent',
                    color: activeTab === 'dashboard' ? 'var(--accent-primary)' : 'var(--text-secondary)'
                  }}
                >
                  📊 Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('events')}
                  className="py-4 font-medium border-b-2 transition whitespace-nowrap"
                  style={{
                    borderColor: activeTab === 'events' ? 'var(--accent-primary)' : 'transparent',
                    color: activeTab === 'events' ? 'var(--accent-primary)' : 'var(--text-secondary)'
                  }}
                >
                  🎫 Etkinlikler ({events.length})
                </button>
                <button
                  onClick={() => setActiveTab('blogs')}
                  className="py-4 font-medium border-b-2 transition whitespace-nowrap"
                  style={{
                    borderColor: activeTab === 'blogs' ? 'var(--accent-primary)' : 'transparent',
                    color: activeTab === 'blogs' ? 'var(--accent-primary)' : 'var(--text-secondary)'
                  }}
                >
                  ✍️ Blog ({blogs.length})
                </button>
                <button
                  onClick={() => setActiveTab('scanner')}
                  className="py-4 font-medium border-b-2 transition whitespace-nowrap"
                  style={{
                    borderColor: activeTab === 'scanner' ? 'var(--accent-primary)' : 'transparent',
                    color: activeTab === 'scanner' ? 'var(--accent-primary)' : 'var(--text-secondary)'
                  }}
                >
                  📱 QR Tarayıcı
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className="py-4 font-medium border-b-2 transition whitespace-nowrap"
                  style={{
                    borderColor: activeTab === 'profile' ? 'var(--accent-primary)' : 'transparent',
                    color: activeTab === 'profile' ? 'var(--accent-primary)' : 'var(--text-secondary)'
                  }}
                >
                  💰 Cüzdan
                </button>
              </div>
            </div>

            <div className="p-8">
              {/* Dashboard Tab */}
              {activeTab === 'dashboard' && (
                <div>
                  <h2 className="font-heading font-bold text-2xl mb-6" style={{ color: 'var(--text-primary)' }}>Dashboard</h2>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="rounded-2xl shadow-sm p-6" style={{ backgroundColor: 'var(--bg-tertiary)', border: '2px solid var(--border-primary)' }}>
                      <div className="text-3xl font-bold mb-2" style={{ color: 'var(--accent-primary)' }}>{events.length}</div>
                      <div className="font-medium" style={{ color: 'var(--text-primary)' }}>Toplam Etkinlik</div>
                    </div>
                    <div className="rounded-2xl shadow-sm p-6" style={{ backgroundColor: 'var(--bg-tertiary)', border: '2px solid var(--border-primary)' }}>
                      <div className="text-3xl font-bold mb-2" style={{ color: 'var(--accent-primary)' }}>{registrations.length}</div>
                      <div className="font-medium" style={{ color: 'var(--text-primary)' }}>Toplam Kayıt</div>
                    </div>
                    <div className="rounded-2xl shadow-sm p-6" style={{ backgroundColor: 'var(--bg-tertiary)', border: '2px solid var(--border-primary)' }}>
                      <div className="text-3xl font-bold mb-2" style={{ color: 'var(--accent-primary)' }}>{checkins.length}</div>
                      <div className="font-medium" style={{ color: 'var(--text-primary)' }}>Check-in Sayısı</div>
                    </div>
                  </div>

                  {/* Recent Registrations */}
                  <div className="border-2 rounded-2xl p-6 mb-6" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-primary)' }}>
                    <h3 className="font-heading font-semibold text-xl mb-4" style={{ color: 'var(--text-primary)' }}>Son Kayıtlar</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr style={{ borderBottom: '2px solid var(--border-primary)' }}>
                            <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--text-primary)' }}>Katılımcı</th>
                            <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--text-primary)' }}>Etkinlik</th>
                            <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--text-primary)' }}>Durum</th>
                          </tr>
                        </thead>
                        <tbody>
                          {registrations.length === 0 ? (
                            <tr>
                              <td colSpan={3} className="text-center py-6" style={{ color: 'var(--text-secondary)' }}>
                                Henüz kayıt bulunmuyor
                              </td>
                            </tr>
                          ) : (
                            registrations.map((reg: any) => (
                            <tr key={reg.id} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                              <td className="py-3 px-4">
                                <div style={{ color: 'var(--text-primary)' }} className="font-medium">{reg.user.name}</div>
                                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{reg.user.email}</div>
                                {reg.user.student_no && (
                                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                    {reg.user.student_no} • {reg.user.department}
                                  </div>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <div style={{ color: 'var(--text-primary)' }} className="font-medium">{reg.event.title}</div>
                                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                  {new Date(reg.event.start_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <Badge variant={reg.status === 'confirmed' ? 'success' : 'warning'}>
                                  {reg.status === 'confirmed' ? 'Onaylandı' : 'Beklemede'}
                                </Badge>
                                {reg.payment_amount && (
                                  <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                                    {reg.payment_amount} {reg.payment_currency}
                                  </div>
                                )}
                              </td>
                            </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Recent Check-ins */}
                  <div className="border-2 rounded-2xl p-6" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-primary)' }}>
                    <h3 className="font-heading font-semibold text-xl mb-4" style={{ color: 'var(--text-primary)' }}>Son Check-in'ler</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr style={{ borderBottom: '2px solid var(--border-primary)' }}>
                            <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--text-primary)' }}>Katılımcı</th>
                            <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--text-primary)' }}>Etkinlik</th>
                            <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--text-primary)' }}>Check-in Zamanı</th>
                            <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--text-primary)' }}>Yöntem</th>
                          </tr>
                        </thead>
                        <tbody>
                          {checkins.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="text-center py-6" style={{ color: 'var(--text-secondary)' }}>
                                Henüz check-in bulunmuyor
                              </td>
                            </tr>
                          ) : (
                            checkins.map((checkin: any) => (
                            <tr key={checkin.id} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                              <td className="py-3 px-4">
                                <div style={{ color: 'var(--text-primary)' }} className="font-medium">{checkin.user.name}</div>
                                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{checkin.user.email}</div>
                              </td>
                              <td className="py-3 px-4">
                                <div style={{ color: 'var(--text-primary)' }} className="font-medium">{checkin.event.title}</div>
                              </td>
                              <td className="py-3 px-4">
                                <div style={{ color: 'var(--text-primary)' }}>
                                  {new Date(checkin.checkin_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </div>
                                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                  {new Date(checkin.checkin_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <Badge variant={checkin.checkin_method === 'beacon' ? 'secondary' : 'primary'}>
                                  {checkin.checkin_method === 'beacon' ? '📡 Beacon' : '📱 QR Code'}
                                </Badge>
                              </td>
                            </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Events Tab */}
              {activeTab === 'events' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-heading font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>Etkinlik Yönetimi</h2>
                    <Button onClick={() => {
                      setEditingEvent(null);
                      setShowEventModal(true);
                    }}>
                      + Yeni Etkinlik Oluştur
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {events.map(event => {
                      const eventEnded = new Date(event.end_at) < new Date();
                      const eventCheckins = checkins.filter(c => c.event_id === event.id).length;
                      const eventRegistrations = registrations.filter(r => r.event_id === event.id);
                      
                      return (
                      <div key={event.id} className="border-2 hover:border-primary/30 rounded-xl p-6 transition-colors" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-primary)' }}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>{event.title}</h3>
                              {eventEnded && (
                                <Badge variant="gray">Bitti</Badge>
                              )}
                            </div>
                            <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>{event.description}</p>
                            <div className="flex flex-wrap gap-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                              <span>📅 {new Date(event.start_at).toLocaleDateString('tr-TR')}</span>
                              <span>📍 {event.location}</span>
                              <span>👥 {event.capacity} kişi</span>
                              <span>💰 {event.price === 0 ? 'Ücretsiz' : `${event.price} ${event.currency}`}</span>
                              {eventRegistrations.length > 0 && (
                                <span className="font-medium text-primary">📝 {eventRegistrations.length} kayıt</span>
                              )}
                              {eventCheckins > 0 && (
                                <span className="font-medium text-secondary">✓ {eventCheckins} check-in</span>
                              )}
                            </div>
                            
                            {/* Participants List */}
                            {eventRegistrations.length > 0 && (
                              <details className="mt-4">
                                <summary className="cursor-pointer text-sm font-medium mb-2" style={{ color: 'var(--accent-primary)' }}>
                                  👥 Katılımcıları Görüntüle ({eventRegistrations.length})
                                </summary>
                                <div className="mt-3 space-y-2 pl-4 border-l-2" style={{ borderColor: 'var(--border-primary)' }}>
                                  {eventRegistrations.map((reg: any) => (
                                    <div key={reg.id} className="text-sm p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                                      <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{reg.user.name}</div>
                                      <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                        {reg.user.email}
                                        {reg.user.student_no && ` • ${reg.user.student_no}`}
                                      </div>
                                      <div className="flex items-center gap-2 mt-1">
                                        <Badge variant={reg.status === 'confirmed' ? 'success' : 'warning'}>
                                          {reg.status === 'confirmed' ? 'Onaylandı' : 'Beklemede'}
                                        </Badge>
                                        {checkins.some(c => c.event_id === event.id && c.user_id === reg.user_id) && (
                                          <Badge variant="secondary">✓ Check-in yapıldı</Badge>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </details>
                            )}
                          </div>
                          <div className="flex flex-col gap-2 ml-4">
                            <button
                              onClick={() => {
                                setEditingEvent(event);
                                setShowEventModal(true);
                              }}
                              className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:opacity-90 transition text-sm font-medium"
                            >
                              ✏️ Düzenle
                            </button>
                            {eventEnded && eventCheckins > 0 && (
                              <button
                                onClick={async () => {
                                  const token = localStorage.getItem('token');
                                  if (!confirm(`${event.title} etkinliği için check-in yapan tüm katılımcılara sertifika dağıtılsın mı?`)) return;
                                  
                                  try {
                                    const res = await fetch('/api/events/auto-certificates', {
                                      method: 'POST',
                                      headers: {
                                        'Authorization': `Bearer ${token}`,
                                        'Content-Type': 'application/json'
                                      },
                                      body: JSON.stringify({ event_id: event.id })
                                    });
                                    
                                    const data = await res.json();
                                    if (res.ok) {
                                      alert(`✅ ${data.certificates_created} sertifika oluşturuldu!\n${data.certificates_skipped > 0 ? `${data.certificates_skipped} sertifika zaten vardı.` : ''}`);
                                    } else {
                                      alert(`❌ Hata: ${data.error}`);
                                    }
                                  } catch (err) {
                                    alert('Bir hata oluştu');
                                  }
                                }}
                                className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:opacity-90 transition text-sm font-medium"
                              >
                                🎓 Otomatik Sertifika
                              </button>
                            )}
                            <button
                              onClick={() => handleIssueCertificates(event.id)}
                              className="px-4 py-2 bg-secondary text-white rounded-xl hover:opacity-90 transition text-sm font-medium"
                            >
                              Sertifika Dağıt
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(event.id)}
                              className="px-4 py-2 bg-red-500 text-white rounded-xl hover:opacity-90 transition text-sm font-medium"
                            >
                              Sil
                            </button>
                          </div>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* QR Scanner Tab */}
              {activeTab === 'scanner' && (
                <div>
                  <h2 className="font-heading font-bold text-2xl mb-6" style={{ color: 'var(--text-primary)' }}>
                    QR Kod Tarayıcı - Check-in
                  </h2>

                  {!currentWallet ? (
                    <div className="border-2 rounded-2xl p-8 text-center" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-primary)' }}>
                      <p className="text-lg mb-4" style={{ color: 'var(--text-secondary)' }}>
                        QR kod taramak için cüzdanınızı bağlayın
                      </p>
                      <WalletConnect />
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Scanner */}
                      <div className="border-2 rounded-2xl p-6" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-primary)' }}>
                        <h3 className="font-semibold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>
                          Kamerayı Katılımcının QR Koduna Tutun
                        </h3>
                        <QRScanner
                          onScan={async (data) => {
                            if (isScanning) return; // Prevent multiple scans
                            
                            setIsScanning(true);
                            setScanError('');
                            setScanResult(null);
                            
                            if (!currentWallet?.accounts?.[0]?.address) {
                              setScanError('Cüzdan adresi bulunamadı');
                              setIsScanning(false);
                              return;
                            }
                            
                            try {
                              const res = await fetch('/api/checkin/qr', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  qr_payload: data,
                                  admin_wallet: currentWallet.accounts[0].address
                                })
                              });

                              const result = await res.json();
                              
                              if (res.ok) {
                                setScanResult(result);
                                // Refresh check-ins
                                const token = localStorage.getItem('token');
                                fetch('/api/admin/checkins', {
                                  headers: { 'Authorization': `Bearer ${token}` }
                                })
                                  .then(r => r.json())
                                  .then(d => setCheckins(Array.isArray(d) ? d : []));
                                
                                // Clear result after 3 seconds
                                setTimeout(() => {
                                  setScanResult(null);
                                  setIsScanning(false);
                                }, 3000);
                              } else {
                                setScanError(result.error || 'Check-in başarısız');
                                setIsScanning(false);
                              }
                            } catch (err) {
                              setScanError('Bir hata oluştu');
                              setIsScanning(false);
                            }
                          }}
                          onError={(error) => setScanError(error)}
                        />
                        
                        {scanError && (
                          <div className="mt-4 p-4 bg-red-100 border-2 border-red-300 rounded-xl">
                            <p className="text-red-700 font-medium">❌ {scanError}</p>
                          </div>
                        )}
                      </div>

                      {/* Result */}
                      <div className="border-2 rounded-2xl p-6" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-primary)' }}>
                        <h3 className="font-semibold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>
                          Check-in Sonucu
                        </h3>
                        
                        {!scanResult ? (
                          <div className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>
                            <p>QR kod tarandığında sonuç burada görünecek</p>
                            <p className="text-xs mt-2">Sonuç 3 saniye görünecek</p>
                          </div>
                        ) : (
                          <div className="space-y-4 animate-fadeIn">
                            <div className="bg-green-100 border-2 border-green-300 rounded-xl p-4 animate-pulse">
                              <p className="text-green-700 font-bold text-lg mb-2">✅ Check-in Başarılı!</p>
                              <p className="text-green-600 text-sm">{scanResult.message}</p>
                              <div className="mt-2 h-1 bg-green-200 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 animate-countdown"></div>
                              </div>
                            </div>

                            <div className="border-2 rounded-xl p-4" style={{ borderColor: 'var(--border-primary)' }}>
                              <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Katılımcı:</h4>
                              <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{scanResult.user?.name}</p>
                              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{scanResult.user?.email}</p>
                              {scanResult.user?.student_no && (
                                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                                  {scanResult.user.student_no} • {scanResult.user.department}
                                </p>
                              )}
                            </div>

                            <div className="border-2 rounded-xl p-4" style={{ borderColor: 'var(--border-primary)' }}>
                              <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Etkinlik:</h4>
                              <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{scanResult.event?.title}</p>
                              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                {scanResult.event?.start_at && new Date(scanResult.event.start_at).toLocaleDateString('tr-TR')}
                              </p>
                            </div>

                            {scanResult.certificate_issued && (
                              <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/20 rounded-xl p-4">
                                <h4 className="font-semibold mb-2 text-primary">🎓 Sertifika Otomatik Oluşturuldu!</h4>
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                  Etkinlik sona erdiği için katılımcıya otomatik olarak NFT sertifikası verildi.
                                </p>
                              </div>
                            )}

                            {scanResult.event_ended && !scanResult.certificate_issued && (
                              <div className="bg-yellow-100 border-2 border-yellow-300 rounded-xl p-4">
                                <p className="text-yellow-700 text-sm">
                                  ⚠️ Etkinlik sona erdi, ancak sertifika zaten daha önce verilmiş.
                                </p>
                              </div>
                            )}

                            {!scanResult.event_ended && (
                              <div className="bg-blue-100 border-2 border-blue-300 rounded-xl p-4">
                                <p className="text-blue-700 text-sm">
                                  ℹ️ Sertifika etkinlik bitiminde otomatik olarak verilecek.
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Blogs Tab */}
              {activeTab === 'blogs' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-heading font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>Blog Yönetimi</h2>
                    <Button onClick={() => {
                      setEditingBlog(null);
                      setShowBlogModal(true);
                    }}>
                      + Yeni Blog Yazısı Oluştur
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {blogs.map(blog => (
                      <div key={blog.id} className="border-2 hover:border-primary/30 rounded-xl p-6 transition-colors" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-primary)' }}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>{blog.title}</h3>
                              <Badge variant="primary">{blog.category}</Badge>
                              {blog.views !== undefined && blog.views > 0 && (
                                <Badge variant="secondary">👁️ {blog.views}</Badge>
                              )}
                            </div>
                            <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>{blog.excerpt}</p>
                            <div className="flex gap-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                              <span>✍️ {blog.author}</span>
                              <span>📅 {new Date(blog.created_at).toLocaleDateString('tr-TR')}</span>
                              {blog.views !== undefined && (
                                <span>👁️ {blog.views} görüntülenme</span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 ml-4">
                            <button
                              onClick={() => {
                                setEditingBlog(blog);
                                setShowBlogModal(true);
                              }}
                              className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:opacity-90 transition text-sm font-medium"
                            >
                              ✏️ Düzenle
                            </button>
                            <button
                              onClick={() => handleDeleteBlog(blog.id)}
                              className="px-4 py-2 bg-red-500 text-white rounded-xl hover:opacity-90 transition text-sm font-medium"
                            >
                              Sil
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <h2 className="font-heading font-bold text-2xl mb-6" style={{ color: 'var(--text-primary)' }}>Admin Cüzdan</h2>

                  {/* Wallet Section */}
                  <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/20 rounded-xl p-6 mb-6">
                    <h3 className="font-semibold text-lg mb-3" style={{ color: 'var(--text-primary)' }}>✨ Admin Cüzdan Özellikleri</h3>
                    <ul className="space-y-2" style={{ color: 'var(--text-primary)' }}>
                      <li className="flex items-center gap-2">
                        <span className="text-primary">✓</span>
                        <span>Ücretli etkinlikler için ödeme kabul etme</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-primary">✓</span>
                        <span>Sertifika NFT'leri mint etme ve dağıtma</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-primary">✓</span>
                        <span>Blockchain üzerinde işlem geçmişi yönetimi</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-primary">✓</span>
                        <span>Smart contract yönetimi ve dağıtımı</span>
                      </li>
                    </ul>
                  </div>

                  <div className="border-2 border-primary/20 rounded-xl p-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>Cüzdan Durumu</h3>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {user.wallet_address ? 'Cüzdan bağlı ve aktif' : 'Cüzdan bağlı değil'}
                        </p>
                      </div>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        user.wallet_address ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <svg className={`w-6 h-6 ${user.wallet_address ? 'text-green-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                    </div>

                    {user.wallet_address ? (
                      <div>
                        <div className="bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20 rounded-lg p-4 mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-medium text-primary">Aktif Cüzdan</p>
                            <Badge variant="success">{user.wallet_type || 'Suiet'}</Badge>
                          </div>
                          <p className="font-mono text-sm font-bold break-all text-white">
                            {user.wallet_address}
                          </p>
                          <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                            Bağlanma: {new Date(user.wallet_connected_at || user.created_at).toLocaleDateString('tr-TR', { 
                              day: 'numeric', 
                              month: 'long', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div className="bg-blue-500/10 border-2 border-blue-400/30 rounded-lg p-3 mb-3">
                          <p className="text-xs text-blue-300">
                            <strong>💰 Ödeme Alıcısı:</strong> Tüm etkinlik ödemeleri bu cüzdan adresine yapılacaktır.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                          ⚠️ Cüzdan bağlı değil
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          Ödemeleri almak için header'dan cüzdan bağlayın
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          </>
          )}
        </div>
      </main>

      {/* Event Modal */}
      <Modal isOpen={showEventModal} onClose={() => {
        setShowEventModal(false);
        setEditingEvent(null);
      }} title={editingEvent ? 'Etkinliği Düzenle' : 'Yeni Etkinlik Oluştur'}>
        <form onSubmit={handleCreateEvent} className="space-y-4">
          <Input 
            name="title" 
            label="Etkinlik Başlığı" 
            defaultValue={editingEvent?.title || ''}
            required 
          />
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Açıklama</label>
            <textarea 
              name="description" 
              rows={3}
              defaultValue={editingEvent?.description || ''}
              className="w-full px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              style={{ backgroundColor: 'var(--bg-secondary)', border: '2px solid var(--border-primary)', color: 'var(--text-primary)' }}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input 
              name="start_at" 
              label="Başlangıç" 
              type="datetime-local" 
              defaultValue={editingEvent?.start_at ? new Date(editingEvent.start_at).toISOString().slice(0, 16) : ''}
              required 
            />
            <Input 
              name="end_at" 
              label="Bitiş" 
              type="datetime-local" 
              defaultValue={editingEvent?.end_at ? new Date(editingEvent.end_at).toISOString().slice(0, 16) : ''}
              required 
            />
          </div>
          <Input 
            name="location" 
            label="Konum" 
            defaultValue={editingEvent?.location || ''}
            required 
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              name="capacity" 
              label="Kapasite" 
              type="number" 
              defaultValue={editingEvent?.capacity?.toString() || ''}
              required 
            />
            <Input 
              name="price" 
              label="Fiyat (0 = Ücretsiz)" 
              type="number" 
              step="0.01" 
              defaultValue={editingEvent?.price?.toString() || '0'}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Para Birimi</label>
            <select 
              name="currency" 
              defaultValue={editingEvent?.currency || 'FREE'}
              className="w-full px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary" 
              style={{ backgroundColor: 'var(--bg-secondary)', border: '2px solid var(--border-primary)', color: 'var(--text-primary)' }}
            >
              <option value="FREE">Ücretsiz</option>
              <option value="SUI">SUI</option>
              <option value="USDC">USDC</option>
              <option value="USDT">USDT</option>
            </select>
          </div>
          <Input 
            name="tags" 
            label="Etiketler (virgülle ayırın)" 
            placeholder="Workshop, Blockchain" 
            defaultValue={editingEvent?.tags?.join(', ') || ''}
            required 
          />
          <Input 
            name="cover_url" 
            label="Kapak Görseli URL" 
            type="url" 
            defaultValue={editingEvent?.cover_url || ''}
            required 
          />
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {editingEvent ? 'Güncelle' : 'Oluştur'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => {
              setShowEventModal(false);
              setEditingEvent(null);
            }}>İptal</Button>
          </div>
        </form>
      </Modal>

      {/* Blog Modal */}
      <Modal isOpen={showBlogModal} onClose={() => {
        setShowBlogModal(false);
        setEditingBlog(null);
      }} title={editingBlog ? 'Blog Yazısını Düzenle' : 'Yeni Blog Yazısı Oluştur'}>
        <form onSubmit={handleCreateBlog} className="space-y-4">
          <Input 
            name="title" 
            label="Başlık" 
            defaultValue={editingBlog?.title || ''}
            required 
          />
          <Input 
            name="author" 
            label="Yazar" 
            defaultValue={editingBlog?.author || user?.name || ''} 
            placeholder="Yazar adı..." 
            required 
          />
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Özet</label>
            <textarea 
              name="excerpt" 
              rows={2}
              defaultValue={editingBlog?.excerpt || ''}
              className="w-full px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              style={{ backgroundColor: 'var(--bg-secondary)', border: '2px solid var(--border-primary)', color: 'var(--text-primary)' }}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>İçerik</label>
            <textarea 
              name="content" 
              rows={6}
              defaultValue={editingBlog?.content || ''}
              className="w-full px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              style={{ backgroundColor: 'var(--bg-secondary)', border: '2px solid var(--border-primary)', color: 'var(--text-primary)' }}
              required
            />
          </div>
          <Input 
            name="cover_url" 
            label="Kapak Görseli URL" 
            type="url" 
            defaultValue={editingBlog?.cover_url || ''}
            required 
          />
          <Input 
            name="category" 
            label="Kategori" 
            placeholder="Blockchain, NFT, Platform..." 
            defaultValue={editingBlog?.category || ''}
            required 
          />
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {editingBlog ? 'Güncelle' : 'Oluştur'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => {
              setShowBlogModal(false);
              setEditingBlog(null);
            }}>İptal</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
