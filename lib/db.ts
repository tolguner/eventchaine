// Mock database storage
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  student_no?: string;
  department?: string;
  class_year?: number;
  walletAddress?: string;
  wallet_connected_at?: string;
  role: 'admin' | 'user';
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  start_at: string;
  end_at: string;
  location: string;
  capacity: number;
  price: number;
  currency: 'MATIC' | 'ETH' | 'FREE';
  tags: string[];
  cover_url: string;
  created_by: string;
  is_published: boolean;
}

export interface Registration {
  id: string;
  user_id: string;
  event_id: string;
  status: 'confirmed' | 'waitlist' | 'cancelled';
  ticket_code: string;
  qr_payload: string;
  payment_tx_hash?: string;
  payment_amount?: number;
  payment_currency?: string;
  created_at: string;
}

export interface CheckIn {
  id: string;
  user_id: string;
  event_id: string;
  method: 'qr' | 'beacon';
  device_hash: string;
  checkin_at: string;
  verifier_id: string;
}

export interface Certificate {
  id: string;
  user_id: string;
  event_id: string;
  certificate_no: string;
  ipfs_cid: string;
  chain: string;
  contract_address: string;
  token_id: string;
  tx_hash: string;
  minted_at: string;
  revoked_at: string | null;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_url: string;
  category: string;
  created_at: string;
  author: string;
}

// Mock data storage
class MockDB {
  users: User[] = [
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
  ];

  events: Event[] = [
    {
      id: 'e_101',
      title: 'Web3 & PoP 101',
      slug: 'web3-pop-101',
      description: 'Blockchain teknolojisi ve Proof of Presence (PoP) kavramına giriş. Soulbound NFT sertifikaları hakkında her şey.',
      start_at: '2025-12-12T14:00:00+03:00',
      end_at: '2025-12-12T16:00:00+03:00',
      location: 'Işık Üniversitesi, A Blok Konferans Salonu',
      capacity: 150,
      price: 0,
      currency: 'FREE',
      tags: ['Workshop', 'Blockchain'],
      cover_url: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80',
      created_by: 'u_admin',
      is_published: true,
    },
    {
      id: 'e_102',
      title: 'Smart Contract Geliştirme',
      slug: 'smart-contract-development',
      description: 'Solidity ile akıllı kontrat yazımı ve Ethereum blockchain\'e deploy etme.',
      start_at: '2025-12-20T14:00:00+03:00',
      end_at: '2025-12-20T17:00:00+03:00',
      location: 'Işık Üniversitesi, B Blok Lab',
      capacity: 80,
      price: 0.05,
      currency: 'MATIC',
      tags: ['Workshop', 'Technical'],
      cover_url: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&q=80',
      created_by: 'u_admin',
      is_published: true,
    },
    {
      id: 'e_103',
      title: 'Kariyer Günleri: Web3 Startup\'ları',
      slug: 'career-day-web3-startups',
      description: 'Web3 alanında çalışan startup\'lardan temsilcilerle networking ve kariyer fırsatları.',
      start_at: '2026-01-10T10:00:00+03:00',
      end_at: '2026-01-10T18:00:00+03:00',
      location: 'Işık Üniversitesi, Merkez Kampüs',
      capacity: 200,
      price: 0,
      currency: 'FREE',
      tags: ['Career', 'Networking'],
      cover_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
      created_by: 'u_admin',
      is_published: true,
    },
    {
      id: 'e_104',
      title: 'NFT ve Dijital Sanat',
      slug: 'nft-digital-art',
      description: 'NFT teknolojisi, dijital sanat pazar yeri ve koleksiyon oluşturma.',
      start_at: '2026-01-15T15:00:00+03:00',
      end_at: '2026-01-15T18:00:00+03:00',
      location: 'Işık Üniversitesi, Sanat Galerisi',
      capacity: 100,
      price: 0.1,
      currency: 'MATIC',
      tags: ['Seminar', 'NFT'],
      cover_url: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80',
      created_by: 'u_admin',
      is_published: true,
    },
    {
      id: 'e_105',
      title: 'DeFi ve Kripto Finansı',
      slug: 'defi-crypto-finance',
      description: 'Merkezi olmayan finans (DeFi) protokolleri ve kripto para ekonomisi.',
      start_at: '2026-01-22T14:00:00+03:00',
      end_at: '2026-01-22T17:00:00+03:00',
      location: 'Işık Üniversitesi, A Blok 301',
      capacity: 120,
      price: 0.02,
      currency: 'ETH',
      tags: ['Workshop', 'Finance'],
      cover_url: 'https://images.unsplash.com/photo-1621504450181-5d356f61d307?w=800&q=80',
      created_by: 'u_admin',
      is_published: true,
    },
    {
      id: 'e_106',
      title: 'Blockchain Güvenliği',
      slug: 'blockchain-security',
      description: 'Akıllı kontrat güvenlik açıkları, audit süreçleri ve best practices.',
      start_at: '2026-02-05T13:00:00+03:00',
      end_at: '2026-02-05T16:00:00+03:00',
      location: 'Online (Zoom)',
      capacity: 200,
      price: 0,
      currency: 'FREE',
      tags: ['Technical', 'Security'],
      cover_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80',
      created_by: 'u_admin',
      is_published: true,
    },
  ];

  registrations: Registration[] = [];
  checkins: CheckIn[] = [];
  certificates: Certificate[] = [];

  blogPosts: BlogPost[] = [
    {
      id: 'b_1',
      title: 'Blockchain ve Web3\'e Giriş',
      slug: 'blockchain-web3-giris',
      excerpt: 'Blockchain teknolojisi nedir ve Web3 ekosistemi nasıl çalışır? Temel kavramlar ve geleceğin interneti.',
      content: 'Blockchain, merkeziyetsiz bir veri yapısıdır. Bloklar halinde zincir şeklinde birbirine bağlanan veriler, kriptografik yöntemlerle güvence altına alınır. Web3 ise bu teknoloji üzerine kurulu yeni nesil internet vizyonudur. Kullanıcılar artık sadece tüketici değil, aynı zamanda sahip ve yönetici konumundadır.',
      cover_url: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80',
      category: 'Blockchain',
      created_at: '2025-11-01T10:00:00Z',
      author: 'IT&MIS Kulübü',
    },
    {
      id: 'b_2',
      title: 'Soulbound NFT\'ler: Devredilemez Dijital Kimlik',
      slug: 'soulbound-nft-dijital-kimlik',
      excerpt: 'Soulbound Token\'lar (SBT) nasıl çalışır ve neden önemlidir? Dijital kimlik ve güven sistemleri.',
      content: 'Soulbound NFT\'ler, blockchain üzerinde saklanır ancak transfer edilemez. Bu özellik sayesinde eğitim sertifikaları, iş deneyimi belgeleri ve topluluk üyelikleri gibi kişisel başarıları temsil edebilirler. Vitalik Buterin tarafından önerilen bu konsept, Web3\'te güven ve itibar sistemlerinin temelini oluşturur.',
      cover_url: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80',
      category: 'NFT',
      created_at: '2025-11-05T10:00:00Z',
      author: 'IT&MIS Kulübü',
    },
    {
      id: 'b_3',
      title: 'Etkinlik Katılımını Kanıtlama: PoP Sistemi',
      slug: 'proof-of-presence-sistem',
      excerpt: 'Proof of Presence platformu ile etkinlik katılımlarınızı blockchain üzerinde kayıt altına alın.',
      content: 'PoP platformu, QR kod ve beacon teknolojisi kullanarak fiziksel katılımı dijital olarak doğrular. Etkinliğe gelen her katılımcı, check-in sırasında QR kodunu taratır ve sistem bunu blockchain\'e kaydeder. Daha sonra katılımcıya Soulbound NFT sertifikası verilir. Bu sertifika, kişinin o etkinliğe katıldığının kalıcı ve değiştirilemez kanıtıdır.',
      cover_url: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&q=80',
      category: 'Platform',
      created_at: '2025-11-10T10:00:00Z',
      author: 'IT&MIS Kulübü',
    },
  ];

  sessions: Map<string, User> = new Map();
}

export const db = new MockDB();
