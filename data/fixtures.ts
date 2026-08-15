import { Event, BlogPost, User, Registration, CheckIn, Certificate } from '@/types';

// Demo Users
export const demoUsers: User[] = [
  {
    id: 'u_admin',
    name: 'Tolga Olguner',
    email: 'tolgaolguner1@gmail.com',
    password: 'tolga123',
    role: 'admin',
    created_at: '2025-01-01T10:00:00Z',
  },
  {
    id: 'u_123',
    name: 'Doğukan Katılımcı',
    email: 'dogukan@gmail.com',
    password: 'dogukan123',
    student_no: '23MIS001',
    department: 'MIS',
    class_year: 2,
    role: 'user',
    created_at: '2025-01-15T10:00:00Z',
  },
  {
    id: 'u_124',
    name: 'Ayşe Yılmaz',
    email: 'ayse@isikun.edu.tr',
    password: 'demo123',
    student_no: '23CS042',
    department: 'Computer Science',
    class_year: 3,
    role: 'user',
    created_at: '2025-02-01T10:00:00Z',
  },
  {
    id: 'u_125',
    name: 'Mehmet Demir',
    email: 'mehmet@isikun.edu.tr',
    password: 'demo123',
    student_no: '22MIS018',
    department: 'MIS',
    class_year: 3,
    wallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    role: 'user',
    created_at: '2025-02-10T10:00:00Z',
  },
  {
    id: 'u_126',
    name: 'Zeynep Kaya',
    email: 'zeynep@isikun.edu.tr',
    password: 'demo123',
    student_no: '23BUS025',
    department: 'Business Administration',
    class_year: 2,
    role: 'organizer',
    created_at: '2025-03-01T10:00:00Z',
  },
];

// Demo Events (6 upcoming + 12 past)
export const upcomingEvents: Event[] = [
  {
    id: 'e_101',
    title: 'Web3 & PoP 101',
    slug: 'web3-pop-101',
    description: 'Blockchain teknolojisi ve Proof of Presence (PoP) kavramına giriş. Soulbound NFT sertifikaları hakkında her şey. Bu workshop\'ta blockchain\'in temellerini, akıllı kontratları ve NFT teknolojisini öğreneceksiniz.',
    start_at: '2025-12-12T14:00:00+03:00',
    end_at: '2025-12-12T16:00:00+03:00',
    location: 'Işık Üniversitesi, A Blok Konferans Salonu',
    capacity: 150,
    tags: ['Workshop', 'Blockchain', 'NFT'],
    cover_url: '/images/event1.jpg',
    created_by: 'u_admin',
    is_published: true,
    price: 0,
    program: [
      { time: '14:00', title: 'Açılış ve Hoş Geldin', speaker: 'Tolga Admin' },
      { time: '14:15', title: 'Blockchain Nedir?', speaker: 'Dr. Ahmet Yıldız', description: 'Blockchain teknolojisinin temelleri' },
      { time: '15:00', title: 'Proof of Presence Kavramı', speaker: 'Tolga Admin', description: 'PoP sistemleri ve kullanım alanları' },
      { time: '15:30', title: 'Soulbound NFT Demo', speaker: 'Doğukan Katılımcı', description: 'Canlı demo ve soru-cevap' },
    ],
  },
  {
    id: 'e_102',
    title: 'Smart Contract Geliştirme',
    slug: 'smart-contract-development',
    description: 'Solidity ile akıllı kontrat yazımı ve Ethereum blockchain\'e deploy etme. Hands-on workshop ile kendi kontratınızı yazın.',
    start_at: '2025-12-20T14:00:00+03:00',
    end_at: '2025-12-20T17:00:00+03:00',
    location: 'Işık Üniversitesi, B Blok Lab',
    capacity: 80,
    tags: ['Workshop', 'Technical', 'Solidity'],
    cover_url: '/images/event2.jpg',
    created_by: 'u_admin',
    is_published: true,
    price: 50,
    program: [
      { time: '14:00', title: 'Solidity Temelleri', speaker: 'Prof. Mehmet Kara' },
      { time: '15:00', title: 'ERC-721 ve NFT Standartları', speaker: 'Prof. Mehmet Kara' },
      { time: '16:00', title: 'Hands-on: İlk Kontratınız', description: 'Gruplar halinde pratik çalışma' },
    ],
  },
  {
    id: 'e_103',
    title: 'Kariyer Günleri: Web3 Startup\'ları',
    slug: 'career-day-web3-startups',
    description: 'Web3 alanında çalışan startup\'lardan temsilcilerle networking ve kariyer fırsatları. CV review, mock interview ve networking sessions.',
    start_at: '2026-01-10T10:00:00+03:00',
    end_at: '2026-01-10T18:00:00+03:00',
    location: 'Işık Üniversitesi, Merkez Kampüs',
    capacity: 200,
    tags: ['Career', 'Networking', 'Startup'],
    cover_url: '/images/event3.jpg',
    created_by: 'u_126',
    is_published: true,
    price: 0,
    program: [
      { time: '10:00', title: 'Açılış Konuşması', speaker: 'Rektör Prof. Dr. ...' },
      { time: '10:30', title: 'Panel: Web3\'te Kariyer', description: '5 startup CEO\'su ile panel' },
      { time: '12:00', title: 'Öğle Yemeği ve Networking' },
      { time: '14:00', title: 'Şirket Standları ve CV Review' },
      { time: '16:00', title: 'Mock Interview Sessions' },
    ],
  },
  {
    id: 'e_104',
    title: 'DeFi ve Yield Farming Workshop',
    slug: 'defi-yield-farming',
    description: 'Decentralized Finance (DeFi) protokolleri, liquidity pool\'lar ve yield farming stratejileri.',
    start_at: '2025-12-28T15:00:00+03:00',
    end_at: '2025-12-28T18:00:00+03:00',
    location: 'Online - Zoom',
    capacity: 300,
    tags: ['Workshop', 'DeFi', 'Finance'],
    cover_url: '/images/event4.jpg',
    created_by: 'u_admin',
    is_published: true,
    price: 0,
  },
  {
    id: 'e_105',
    title: 'NFT Marketplace Oluşturma',
    slug: 'nft-marketplace-creation',
    description: 'React, Next.js ve Web3.js kullanarak kendi NFT marketplace\'inizi oluşturun. 2 günlük intensive bootcamp.',
    start_at: '2026-01-15T09:00:00+03:00',
    end_at: '2026-01-16T18:00:00+03:00',
    location: 'Işık Üniversitesi, Teknoloji Merkezi',
    capacity: 50,
    tags: ['Bootcamp', 'Technical', 'NFT'],
    cover_url: '/images/event5.jpg',
    created_by: 'u_admin',
    is_published: true,
    price: 150,
  },
  {
    id: 'e_106',
    title: 'DAO Yönetimi ve Organizasyon',
    slug: 'dao-management',
    description: 'Decentralized Autonomous Organizations (DAO) yapıları, governance token\'lar ve topluluk yönetimi.',
    start_at: '2026-01-25T16:00:00+03:00',
    end_at: '2026-01-25T19:00:00+03:00',
    location: 'Işık Üniversitesi, C Blok Seminer Odası',
    capacity: 100,
    tags: ['Seminar', 'DAO', 'Governance'],
    cover_url: '/images/event6.jpg',
    created_by: 'u_126',
    is_published: true,
    price: 0,
  },
];

export const pastEvents: Event[] = [
  {
    id: 'e_001',
    title: 'Blockchain\'e Giriş Semineri',
    slug: 'blockchain-intro-seminar',
    description: 'Blockchain teknolojisinin temellerini öğrenin.',
    start_at: '2025-09-15T14:00:00+03:00',
    end_at: '2025-09-15T16:00:00+03:00',
    location: 'Işık Üniversitesi, Konferans Salonu',
    capacity: 120,
    tags: ['Seminar', 'Blockchain'],
    cover_url: '/images/past1.jpg',
    created_by: 'u_admin',
    is_published: true,
  },
  {
    id: 'e_002',
    title: 'Ethereum ve Smart Contracts',
    slug: 'ethereum-smart-contracts',
    description: 'Ethereum blockchain ve akıllı kontratlar.',
    start_at: '2025-09-22T15:00:00+03:00',
    end_at: '2025-09-22T18:00:00+03:00',
    location: 'Işık Üniversitesi, Lab',
    capacity: 60,
    tags: ['Workshop', 'Ethereum'],
    cover_url: '/images/past2.jpg',
    created_by: 'u_admin',
    is_published: true,
  },
  {
    id: 'e_003',
    title: 'Web3 Hackathon 2025',
    slug: 'web3-hackathon-2025',
    description: '48 saatlik Web3 hackathon yarışması.',
    start_at: '2025-10-05T09:00:00+03:00',
    end_at: '2025-10-07T18:00:00+03:00',
    location: 'Işık Üniversitesi, Teknoloji Merkezi',
    capacity: 100,
    tags: ['Hackathon', 'Competition'],
    cover_url: '/images/past3.jpg',
    created_by: 'u_admin',
    is_published: true,
  },
  {
    id: 'e_004',
    title: 'Crypto Trading Temelleri',
    slug: 'crypto-trading-basics',
    description: 'Kripto para trading stratejileri ve teknik analiz.',
    start_at: '2025-10-12T16:00:00+03:00',
    end_at: '2025-10-12T19:00:00+03:00',
    location: 'Online',
    capacity: 200,
    tags: ['Seminar', 'Trading'],
    cover_url: '/images/past4.jpg',
    created_by: 'u_126',
    is_published: true,
  },
  {
    id: 'e_005',
    title: 'NFT Sanat Sergisi',
    slug: 'nft-art-exhibition',
    description: 'Dijital sanat ve NFT koleksiyonları sergisi.',
    start_at: '2025-10-20T10:00:00+03:00',
    end_at: '2025-10-20T20:00:00+03:00',
    location: 'Işık Üniversitesi, Sanat Galerisi',
    capacity: 150,
    tags: ['Exhibition', 'NFT', 'Art'],
    cover_url: '/images/past5.jpg',
    created_by: 'u_126',
    is_published: true,
  },
  {
    id: 'e_006',
    title: 'Metaverse ve Sanal Dünyalar',
    slug: 'metaverse-virtual-worlds',
    description: 'Metaverse platformları ve sanal emlak.',
    start_at: '2025-10-28T14:00:00+03:00',
    end_at: '2025-10-28T17:00:00+03:00',
    location: 'Işık Üniversitesi, VR Lab',
    capacity: 40,
    tags: ['Workshop', 'Metaverse'],
    cover_url: '/images/past6.jpg',
    created_by: 'u_admin',
    is_published: true,
  },
  {
    id: 'e_007',
    title: 'Solidity Security Best Practices',
    slug: 'solidity-security',
    description: 'Akıllı kontrat güvenliği ve audit.',
    start_at: '2025-11-05T15:00:00+03:00',
    end_at: '2025-11-05T18:00:00+03:00',
    location: 'Işık Üniversitesi, B Blok',
    capacity: 70,
    tags: ['Workshop', 'Security'],
    cover_url: '/images/past7.jpg',
    created_by: 'u_admin',
    is_published: true,
  },
  {
    id: 'e_008',
    title: 'Layer 2 Scaling Solutions',
    slug: 'layer2-scaling',
    description: 'Ethereum L2 çözümleri: Polygon, Arbitrum, Optimism.',
    start_at: '2025-11-12T16:00:00+03:00',
    end_at: '2025-11-12T18:00:00+03:00',
    location: 'Online - YouTube Live',
    capacity: 500,
    tags: ['Seminar', 'Technical'],
    cover_url: '/images/past8.jpg',
    created_by: 'u_admin',
    is_published: true,
  },
  {
    id: 'e_009',
    title: 'Web3 Kariyer Paneli',
    slug: 'web3-career-panel',
    description: 'Blockchain şirketlerinden kariyer tavsiyeleri.',
    start_at: '2025-11-18T14:00:00+03:00',
    end_at: '2025-11-18T17:00:00+03:00',
    location: 'Işık Üniversitesi, Ana Salon',
    capacity: 180,
    tags: ['Career', 'Panel'],
    cover_url: '/images/past9.jpg',
    created_by: 'u_126',
    is_published: true,
  },
  {
    id: 'e_010',
    title: 'IPFS ve Decentralized Storage',
    slug: 'ipfs-decentralized-storage',
    description: 'Merkeziyetsiz depolama sistemleri.',
    start_at: '2025-11-22T15:00:00+03:00',
    end_at: '2025-11-22T18:00:00+03:00',
    location: 'Işık Üniversitesi, Lab',
    capacity: 50,
    tags: ['Workshop', 'Technical'],
    cover_url: '/images/past10.jpg',
    created_by: 'u_admin',
    is_published: true,
  },
  {
    id: 'e_011',
    title: 'Token Economics 101',
    slug: 'token-economics',
    description: 'Tokenomics ve kripto ekonomi temelleri.',
    start_at: '2025-11-25T16:00:00+03:00',
    end_at: '2025-11-25T19:00:00+03:00',
    location: 'Online',
    capacity: 300,
    tags: ['Seminar', 'Economics'],
    cover_url: '/images/past11.jpg',
    created_by: 'u_126',
    is_published: true,
  },
  {
    id: 'e_012',
    title: 'Zero-Knowledge Proofs Workshop',
    slug: 'zk-proofs-workshop',
    description: 'ZK-SNARKs ve gizlilik teknolojileri.',
    start_at: '2025-11-28T14:00:00+03:00',
    end_at: '2025-11-28T18:00:00+03:00',
    location: 'Işık Üniversitesi, Araştırma Lab',
    capacity: 30,
    tags: ['Workshop', 'Advanced', 'Privacy'],
    cover_url: '/images/past12.jpg',
    created_by: 'u_admin',
    is_published: true,
  },
];

// Demo Blog Posts
export const blogPosts: BlogPost[] = [
  {
    id: 'b_1',
    title: 'Blockchain ve Web3\'e Giriş',
    slug: 'blockchain-web3-giris',
    excerpt: 'Blockchain teknolojisi nedir ve Web3 ekosistemi nasıl çalışır? Temel kavramlar ve geleceğin interneti.',
    content: `
# Blockchain ve Web3'e Giriş

Blockchain, merkeziyetsiz bir veri yapısıdır ve verilerin güvenli, şeffaf ve değiştirilemez bir şekilde saklanmasını sağlar.

## Blockchain Nedir?

Blockchain, bloklar halinde organize edilmiş, kriptografik olarak güvenli bir dağıtık defterdir. Her blok:
- Önceki bloğun hash'ini içerir
- İşlem verilerini depolar
- Zaman damgası taşır
- Değiştirilemeyen (immutable) yapıdadır

## Web3 Ekosistemi

Web3, internetin merkeziyetsiz versiyonudur:
- **Web1**: Read-only (Sadece okuma)
- **Web2**: Read-write (Okuma-yazma, merkezi platformlar)
- **Web3**: Read-write-own (Okuma-yazma-sahiplenme, merkeziyetsiz)

## Neden Önemli?

- Kullanıcılar verilerinin sahibidir
- Aracılar ortadan kalkar
- Şeffaflık ve güven artar
- Global erişim ve finansal içerme sağlar

IT&MIS Kulübü olarak Web3 teknolojilerini öğrenmenizi ve bu alanda kariyerler oluşturmanızı destekliyoruz.
    `,
    cover_url: '/images/blog1.jpg',
    category: 'Blockchain',
    created_at: '2025-11-01T10:00:00Z',
    author: 'IT&MIS Kulübü',
  },
  {
    id: 'b_2',
    title: 'Soulbound NFT\'ler: Devredilemez Dijital Kimlik',
    slug: 'soulbound-nft-dijital-kimlik',
    excerpt: 'Soulbound Token\'lar (SBT) nasıl çalışır ve neden önemlidir? Dijital kimlik ve güven sistemleri.',
    content: `
# Soulbound NFT'ler: Devredilemez Dijital Kimlik

Soulbound NFT'ler (SBT), blockchain üzerinde saklanır ancak normal NFT'lerin aksine **devredilemez ve satılamaz**. 

## Soulbound Ne Demek?

"Soulbound" terimi, video oyunlarından gelir ve bir karaktere kalıcı olarak bağlı olan öğeleri ifade eder. Blockchain dünyasında, bir cüzdana kalıcı olarak bağlı olan token'ları temsil eder.

## Kullanım Alanları

### 1. Eğitim Sertifikaları
- Diploma ve sertifikalar SBT olarak basılabilir
- Sahtecilik önlenir
- Doğrulama anında yapılır

### 2. Etkinlik Katılım Belgeleri
- Konferanslar, workshoplar
- Topluluk üyelikleri
- **Proof of Presence** sistemleri

### 3. İş Deneyimi ve Referanslar
- Çalışma geçmişi
- Skill attestations
- Profesyonel ağ

### 4. Kredi Skorları ve İtibar
- DeFi kredi skoru
- DAO'da oylama gücü
- Topluluk itibarı

## EventChain ve SBT

EventChain platformunda, etkinliklere katıldığınızda SBT sertifikası alırsınız:
- QR kod ile check-in yaparsınız
- Katılımınız blockchain'de doğrulanır
- Devredilemez sertifikanız cüzdanınıza gönderilir
- İstediğiniz zaman doğrulama yapabilirsiniz

Bu sistem, CV'nize ekleyebileceğiniz, doğrulanabilir katılım kanıtları oluşturur.
    `,
    cover_url: '/images/blog2.jpg',
    category: 'NFT',
    created_at: '2025-11-05T10:00:00Z',
    author: 'IT&MIS Kulübü',
  },
  {
    id: 'b_3',
    title: 'Etkinlik Katılımını Kanıtlama: PoP Sistemi',
    slug: 'proof-of-presence-sistem',
    excerpt: 'Proof of Presence platformu ile etkinlik katılımlarınızı blockchain üzerinde kayıt altına alın.',
    content: `
# Etkinlik Katılımını Kanıtlama: Proof of Presence (PoP) Sistemi

Proof of Presence (PoP), fiziksel veya sanal bir etkinliğe katılımınızı kriptografik olarak kanıtlama sistemidir.

## Nasıl Çalışır?

### 1. Ön Kayıt
- Etkinliğe web üzerinden kayıt olursunuz
- Sistem size bir QR kod içeren bilet oluşturur
- QR kod, kriptografik imza ile korunur

### 2. Check-in
Etkinlik günü, iki yöntemle check-in yapabilirsiniz:

**QR Kod Yöntemi:**
- Giriş noktasında QR kodunuzu taratırsınız
- Sistem, imzayı doğrular
- Katılımınız kaydedilir

**Beacon Yöntemi (Gelecek):**
- Bluetooth beacon'lar salon içinde bulunur
- Mobil uygulama otomatik olalgılar
- Minimum süre katılım kontrolü yapılır

### 3. Sertifika Basımı
- Etkinlik sonrası, organizatör sertifikaları basar
- Her katılımcı için:
  - IPFS'e metadata yüklenir
  - Blockchain'e SBT mint edilir
  - Transaction hash kaydedilir

### 4. Doğrulama
- Sertifika numarası ile doğrulama yapılabilir
- Blockchain explorer'da kontrol edilebilir
- IPFS'ten metadata okunabilir

## EventChain'in Avantajları

✅ **Sahtecilik Önleme**: Kriptografik güvenlik
✅ **Anlık Doğrulama**: Blockchain üzerinde hemen kontrol
✅ **Devredilemez**: Soulbound NFT teknolojisi
✅ **Global Standart**: ERC-721 uyumlu
✅ **Kalıcı Kayıt**: IPFS + Polygon blockchain
✅ **Kolay Paylaşım**: Certificate no ile doğrulama

## Teknoloji Stack

- **Frontend**: Next.js 14 + TypeScript
- **Smart Contract**: Solidity 0.8.20
- **Blockchain**: Polygon (Mumbai Testnet)
- **Storage**: IPFS
- **QR Security**: HMAC-SHA256
- **Standards**: ERC-721, EIP-5192 (Soulbound)

EventChain ile katılımlarınız artık sadece bir anı değil, doğrulanabilir bir dijital varlık!
    `,
    cover_url: '/images/blog3.jpg',
    category: 'Platform',
    created_at: '2025-11-10T10:00:00Z',
    author: 'IT&MIS Kulübü',
  },
];

// Mock data for seed
export const mockRegistrations: Registration[] = [];
export const mockCheckIns: CheckIn[] = [];
export const mockCertificates: Certificate[] = [];
