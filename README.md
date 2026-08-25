# EventChain — Web3 Etkinlik Yönetim Platformu

Etkinlik kaydı, QR ile yoklama ve katılım sertifikası akışını tek yerde toplayan
Next.js uygulaması. Kimlik doğrulama SUI cüzdanı ile yapılır; sertifikalar
Soulbound (devredilemez) NFT olarak tasarlanmıştır.

Işık Üniversitesi'nde blockchain dersi kapsamında hazırlanmış, teslim edilmiş bir
dönem projesidir. Aktif geliştirilen bir ürün değildir.

## Durum

Uygulama kurulup çalıştırılabilir durumda: cüzdanla giriş, etkinlik listeleme,
kayıt olma, QR bilet üretme, QR ile check-in ve sertifika kayıtları veritabanı
üzerinde uçtan uca çalışıyor.

Blockchain tarafı da gerçek: cüzdan bağlama, bakiye okuma, SUI transferi ve
NFT mint SUI testnet üzerinde çalışır. `proof_of_presence` Move modülü
testnet'e yayınlandı (package ID `.env.example`'da tanımlı); admin panelinden
"Sertifika Dağıt" dendiğinde gerçek bir `Certificate` nesnesi mint edilip
alıcının cüzdanına gönderilir. IPFS metadata yükleme hâlâ opsiyoneldir — API
anahtarı yoksa taklit edilir. Ayrıntılar için
[Blockchain entegrasyonunun gerçek durumu](#blockchain-entegrasyonunun-gerçek-durumu)
bölümüne bakın.

## Özellikler

**Çalışanlar**

- SUI cüzdanı ile giriş/kayıt (Sui Wallet, Suiet, Wallet Standard)
- Etkinlik listeleme ve detay sayfası; başlık/açıklama araması, etiket ve
  ücretsiz/ücretli filtresi
- Etkinliğe kayıt; kapasite ve mükerrer kayıt kontrolü
- HMAC-SHA256 imzalı QR bilet üretimi
- Kamera ile QR okuyup check-in (admin paneli)
- Etkinlik bitiminde check-in yapanlara toplu sertifika kaydı
- Sertifika numarası veya tx hash ile herkese açık doğrulama sayfası (`/verify`)
- Blog listeleme, detay ve tekilleştirilmiş (çerez bazlı) görüntülenme sayacı
- Profil yönetimi (ad, e-posta, öğrenci no, bölüm, sınıf)
- Admin panosu: etkinlik ve blog CRUD, kayıt/check-in listeleri, sayaçlar
- Açık/koyu tema
- Ödeme: SUI ve USDC (Circle'ın resmi testnet coin type'ı, `coinWithBalance`
  ile); USDT desteklenmiyor, ayrıntı için aşağıya bakın
- Beacon ile check-in: profildeki bilet kartında "Beacon ile Check-in (Demo)"
  butonu — gerçek BLE donanımı yok, tarama simüle edilir, ama check-in
  gerçekten veritabanına yazılır
- Birim testleri: `lib/slug.ts`, `lib/crypto.ts`, `lib/validation.ts` için
  (Vitest, `npm test`)

**Eksik ya da yarım kalanlar**

- **USDT desteklenmiyor.** Sui testnet'inde resmi/doğrulanmış bir USDT coin
  type'ı yok — yalnızca kaynağı belirsiz, topluluk kaynaklı mock coin'ler
  var. Uydurma bir adres kullanmak yerine bu para birimi bilinçli olarak
  desteklenmedi (bkz. `lib/suiPayment.ts`). SUI ve USDC gerçek çalışıyor.
- Testler yalnızca saf yardımcı fonksiyonları kapsıyor (slug üretimi, QR/
  bilet imzalama, form doğrulama); API route'ları veya React bileşenleri
  için test yok.

## Teknoloji

| Katman | Kullanılan |
|---|---|
| Framework | Next.js 14 (App Router), React 18, TypeScript |
| Stil | Tailwind CSS, CSS değişkenleriyle tema |
| Veritabanı | SQLite + Prisma ORM |
| Kimlik doğrulama | Cüzdan tabanlı, token'lı session (DB'de saklanır) |
| Blockchain | `@mysten/sui`, `@mysten/dapp-kit` (SUI Testnet) |
| EVM tarafı | Hardhat + Solidity 0.8.20 (yalnızca kaynak kod) |
| QR | `qrcode` (üretim), `qr-scanner` (kamera) |

## Kurulum

Node.js 18+ gerekir.

```bash
npm install
cp .env.example .env
npx prisma migrate deploy
npm run db:seed
npm run dev
```

`http://localhost:3000` adresinde açılır. Seed; bir admin kullanıcı, 6 örnek
etkinlik ve 3 blog yazısı yükler.

Testleri çalıştırmak için:

```bash
npm test
```

### Giriş nasıl yapılır

Uygulamada e-posta/şifre ile giriş **yoktur**; `/auth/signin` sayfası doğrudan
cüzdan bağlama ekranıdır.

1. Tarayıcınıza Sui Wallet veya Suiet kurun, ağı **Testnet** yapın.
2. `/auth/signin` sayfasından cüzdanı bağlayın. İlk bağlanışta
   `wallet_xxxxxxxx@temp.com` geçici e-postasıyla yeni bir kullanıcı oluşturulur.
3. Admin olmak için: `/profile` sayfasından e-postanızı, `app/api/auth/wallet`
   içindeki `ADMIN_EMAILS` listesinde yazan adresle değiştirin, sonra çıkıp
   yeniden cüzdanla giriş yapın. Rol o anda `admin` olarak güncellenir.

Ücretli etkinliklere kayıt için cüzdanda testnet SUI bulunmalıdır
([faucet](https://faucet.sui.io/)).

## Blockchain entegrasyonunun gerçek durumu

| Parça | Durum | Not |
|---|---|---|
| Cüzdan bağlama | Gerçek | dapp-kit üzerinden Wallet Standard |
| Bakiye okuma | Gerçek | `suiClient.getBalance` |
| Ödeme (SUI / USDC) | Gerçek | `coinWithBalance` ile ilgili coin type'tan otomatik seçim/parçalama, sonuç `waitForTransaction` ile doğrulanır. USDC coin type'ı Circle'ın resmi testnet adresi |
| Transaction imzalama | Gerçek | Cüzdan penceresinde onaylanır |
| NFT mint | Gerçek | `proof_of_presence` modülü testnet'e yayınlandı; `NEXT_PUBLIC_SUI_PACKAGE_ID` doluysa gerçek `Certificate` nesnesi mint edilip alıcıya transfer edilir. `.env.example`'daki değer, `.env` boş bırakılırsa bu paketi kullanır |
| Soulbound kısıtı | Gerçek | `Certificate` struct'ında `store` yeteneği yok; mint dışında hiçbir adrese transfer edilemez (tip sisteminde zorunlu) |
| Mint yetkisi | Gerçek | `mint` bir `AdminCap` nesnesi ister; bu nesne yalnızca paketi yayınlayan cüzdanda vardır. Nesne olmadan işlem hiç kurulamaz (`Expected 7 args, found 6`), yanlış tipte bir nesneyle denenirse zincir `TypeMismatch` ile reddeder. Uygulama katmanındaki oturum kontrolüne (`/api/events/[id]/certificates/issue`) ek, zincir seviyesinde ikinci bir güvence |
| IPFS metadata | **Simülasyon** | NFT.Storage anahtarı tanımlı değilse sahte bir CID üretilir |
| Sertifika kaydı | Gerçek | Mint sonucu (`tx_hash`, `token_id`, `ipfs_cid`) `/api/events/auto-certificates` tarafından veritabanına yazılır; mint yapılmadıysa bu alanlar boş bırakılır (uydurma değer üretilmez) |
| Zincirden doğrulama | Gerçek | `lib/verification.ts`, mint edilmiş gerçek object ID'ler için `getObject` ile zincirden okur |
| Solidity kontratı | Gerçek | `contracts/ProofOfPresenceSBT.sol` Polygon Amoy testnet'e deploy edildi ve gerçek bir mint ile test edildi; opsiyonel EVM tarafı, proje SUI'yi ana zincir olarak kullanıyor |

Kısacası: para transferi, sertifika mint'i (SUI) ve opsiyonel Polygon
kontratı üçü de artık gerçek zincir işlemi. Eksik kalan tek parça IPFS
yüklemesi (NFT.Storage API anahtarı gerektirir, yoksa taklit edilir).

## Proje yapısı

```
eventchaine/
├── app/
│   ├── api/               # Next.js API route'ları
│   ├── admin/             # Admin paneli (pano, etkinlik, blog, QR, cüzdan)
│   ├── auth/              # Cüzdanla giriş / kayıt
│   ├── events/            # Etkinlik listesi ve detay
│   ├── blog/              # Blog listesi ve detay
│   ├── profile/           # Biletlerim, sertifikalarım, profil
│   ├── verify/            # Herkese açık sertifika doğrulama
│   ├── about/, contact/
│   └── page.tsx           # Ana sayfa
├── components/            # Ortak bileşenler (QRModal, QRScanner, WalletConnect, ...)
├── contexts/              # WalletContext, ThemeContext
├── lib/
│   ├── prisma.ts          # Prisma istemcisi
│   ├── crypto.ts          # Bilet kodu ve HMAC imzalı QR payload (+ test)
│   ├── slug.ts            # Türkçe karakter destekli URL slug'ı (+ test)
│   ├── validation.ts      # Form doğrulama yardımcıları (+ test)
│   ├── suiNFT.ts          # NFT mint (AdminCap ile korumalı gerçek mint)
│   ├── suiPayment.ts      # SUI/USDC transferi ve bakiye
│   ├── verification.ts    # Zincirden sertifika doğrulama
│   ├── ipfs.ts            # NFT.Storage yükleme (anahtar yoksa sahte CID)
│   └── certificateImage.ts
├── contracts/
│   └── ProofOfPresenceSBT.sol   # ERC-721 SBT (Polygon Amoy'a deploy edildi; opsiyonel EVM tarafı)
├── scripts/
│   └── deploy.js          # Polygon deploy script'i
├── sui/proof_of_presence/ # SUI Move modülü — mint fonksiyonu (testnet'e deploy edildi, AdminCap ile korumalı)
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
└── hardhat.config.ts
```

## API uç noktaları

**Kimlik / cüzdan**
- `POST /api/auth/wallet` — cüzdan ile giriş veya ilk kayıt
- `POST /api/wallet/connect`, `DELETE /api/wallet/connect` — profile cüzdan bağla/kaldır
- `GET /api/me/wallets` — cüzdanları listele (ekleme/silme kapalıdır)

**Etkinlikler**
- `GET /api/events` — `tag`, `date`, `q` ile filtreleme
- `POST /api/events`, `PUT /api/events/[id]`, `DELETE /api/events/[id]` — admin CRUD
- `GET /api/events/[id]` — id veya slug ile detay
- `POST /api/events/[id]/register` — kayıt ol

**Sertifikalar**
- `POST /api/events/[id]/certificates/issue` — seçili veya check-in yapan kullanıcılara
- `POST /api/events/auto-certificates` — biten etkinlikte toplu sertifika
- `GET /api/events/auto-certificates` — biten etkinliklerin sertifika durumu
- `GET /api/certificates/verify?certificate_no=...` veya `?tx_hash=...`

**Check-in**
- `POST /api/checkin/qr` — QR ile check-in (admin cüzdanı doğrulanır)
- `POST /api/checkin/beacon` — BLE beacon ile check-in (simülasyon; profil sayfasından çağrılıyor)
- `GET /api/tickets/[ticket_code]` — bilet koduyla kayıt sorgu

**Profil / içerik / istatistik**
- `GET /api/me/profile`, `PUT /api/me/profile`
- `GET /api/me/registrations`, `GET /api/me/certificates`
- `GET /api/admin/registrations`, `GET /api/admin/checkins`, `GET /api/admin/wallet`
- `GET /api/posts`, `POST /api/posts`, `GET/PUT/DELETE /api/posts/[slug]` (admin CRUD; GET görüntülenmeyi günde bir kez artırır)
- `GET /api/stats`
- `POST /api/contact` — iletişim formu mesajı gönder; `GET /api/contact` (admin) mesajları listeler

## Veritabanı

SQLite, Prisma ile yönetilir. Modeller: `User`, `Wallet`, `Session`, `Event`,
`Registration`, `CheckIn`, `Certificate`, `BlogPost`, `ContactMessage`.

`Event.tags` SQLite dizi desteklemediği için JSON string olarak saklanır.
`CheckIn` ve `Certificate` üzerinde `user_id + event_id` bileşik unique kısıtı
vardır; mükerrer check-in ve mükerrer sertifika bu şekilde engellenir.

Kurulum, PostgreSQL'e geçiş ve sorun giderme için: [DATABASE_SETUP.md](./DATABASE_SETUP.md)

```bash
npx prisma studio      # veritabanını görsel arayüzde aç
npm run db:seed        # örnek veriyi yeniden yükle
```

## Bilinen sorunlar

- QR tarayıcı mobil tarayıcılarda test edilmedi.

## Ortam değişkenleri

`.env.example` dosyasını `.env` olarak kopyalayın. Uygulamanın çalışması için
yalnızca `DATABASE_URL` zorunludur; diğerleri blockchain özelliklerini
etkinleştirir.

```env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_SUI_NETWORK="testnet"
NEXT_PUBLIC_SUI_PACKAGE_ID="0x…"          # .env.example'da testnet'teki gerçek paket tanımlı
NEXT_PUBLIC_SUI_ADMIN_CAP_ID="0x…"        # mint için zincirde zorunlu yetki nesnesi
NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS="0x…" # ödemelerin gideceği adres
NFT_STORAGE_KEY=""                        # boşsa IPFS yüklemesi taklit edilir
```

Opsiyonel Polygon tarafı için `POLYGON_AMOY_RPC`, `PRIVATE_KEY`,
`NEXT_PUBLIC_POLYGON_CONTRACT_ADDRESS` — bkz. [DEPLOYMENT.md](./DEPLOYMENT.md).

`.env` dosyası depoya dahil değildir ve olmamalıdır.

## Lisans ve künye

MIT.

Işık Üniversitesi IT&MIS Kulübü — blockchain dersi dönem projesi.
