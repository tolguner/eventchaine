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

Blockchain tarafı ise **kısmen gerçek, kısmen simülasyondur.** Cüzdan bağlama,
bakiye okuma, transaction imzalama ve SUI transferi gerçek zincir üzerinde
çalışır; ancak projeye ait bir SUI Move modülü **hiçbir zaman deploy edilmedi.**
Bu yüzden sertifikalar gerçek bir NFT olarak mint edilmez. Ayrıntılar için
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

**Eksik ya da yarım kalanlar**

- Ödeme akışı yalnızca SUI transferi yapar; USDC/USDT desteği yoktur.
- Beacon ile check-in için arayüzde bir ekran yok; `/api/checkin/beacon`
  veritabanına bağlı ve çalışıyor, ama hiçbir sayfa çağırmıyor.
- Şifreler hash'lenmiyor. Zaten şifreyle giriş yapılmıyor (giriş cüzdanla), ama
  şema `password` alanını taşıyor.
- Test yok.

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
| SUI ödemesi | Gerçek | `splitCoins` + `transferObjects`, sonuç `waitForTransaction` ile doğrulanır |
| Transaction imzalama | Gerçek | Cüzdan penceresinde onaylanır |
| NFT mint | **Simülasyon** | Move modülü deploy edilmediği için `NEXT_PUBLIC_SUI_PACKAGE_ID` `0x0`'dır; bu durumda alıcıya 1 MIST gönderen demo transaction imzalanır, NFT oluşmaz |
| IPFS metadata | **Simülasyon** | NFT.Storage anahtarı tanımlı değilse sahte bir CID üretilir |
| Sertifika kaydı | Kısmi | Gerçek mint yapılmadığı sürece `tx_hash`, `token_id` ve `ipfs_cid` boş bırakılır (uydurma değer üretilmez). Admin panelinden cüzdanla mint edilirse `/api/events/auto-certificates` gerçek sonuçla günceller |
| Zincirden doğrulama | Kısmi | `lib/verification.ts` gerçek `getObject` sorguları yapar, ancak object ID boş olduğu sürece pratikte sonuç dönmez |
| Solidity kontratı | Derleniyor | `contracts/ProofOfPresenceSBT.sol` OpenZeppelin v5 uyumlu (Counters.sol kaldırıldı); deploy edilmedi, `scripts/deploy.js` hâlâ yok |

Kısacası: para transferi gerçek, sertifika mint'i değil. Bunu gerçek hâle
getirmek için bir SUI Move modülü yazılıp deploy edilmesi ve package ID'sinin
`.env`'e yazılması gerekir.

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
│   ├── crypto.ts          # Bilet kodu ve HMAC imzalı QR payload
│   ├── suiNFT.ts          # NFT mint (Move modülü yoksa demo transaction)
│   ├── suiPayment.ts      # SUI transferi ve bakiye
│   ├── verification.ts    # Zincirden sertifika doğrulama
│   ├── ipfs.ts            # NFT.Storage yükleme (anahtar yoksa sahte CID)
│   └── certificateImage.ts
├── contracts/
│   └── ProofOfPresenceSBT.sol   # ERC-721 SBT (derleniyor, deploy edilmedi; opsiyonel EVM tarafı)
├── scripts/
│   └── deploy.js          # Polygon deploy script'i (derlendi, çalıştırılmadı)
├── sui/proof_of_presence/ # SUI Move modülü — mint fonksiyonu (derlendi, test edildi, deploy edilmedi)
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
- `POST /api/checkin/beacon` — BLE beacon ile check-in (arayüzde çağıran ekran yok)
- `GET /api/tickets/[ticket_code]` — bilet koduyla kayıt sorgu

**Profil / içerik / istatistik**
- `GET /api/me/profile`, `PUT /api/me/profile`
- `GET /api/me/registrations`, `GET /api/me/certificates`
- `GET /api/admin/registrations`, `GET /api/admin/checkins`, `GET /api/admin/wallet`
- `GET /api/posts`, `POST /api/posts`, `GET/PUT/DELETE /api/posts/[slug]` (admin CRUD; GET görüntülenmeyi günde bir kez artırır)
- `GET /api/stats`

## Veritabanı

SQLite, Prisma ile yönetilir. Modeller: `User`, `Wallet`, `Session`, `Event`,
`Registration`, `CheckIn`, `Certificate`, `BlogPost`.

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
- `contracts/ProofOfPresenceSBT.sol` deploy edilmedi; `scripts/deploy.js`
  hâlâ yazılmadı (bkz. [DEPLOYMENT.md](./DEPLOYMENT.md)).

## Ortam değişkenleri

`.env.example` dosyasını `.env` olarak kopyalayın. Uygulamanın çalışması için
yalnızca `DATABASE_URL` zorunludur; diğerleri blockchain özelliklerini
etkinleştirir.

```env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_SUI_NETWORK="testnet"
NEXT_PUBLIC_SUI_PACKAGE_ID="0x0"          # Move modülü deploy edilirse buraya
NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS="0x…" # ödemelerin gideceği adres
NFT_STORAGE_KEY=""                        # boşsa IPFS yüklemesi taklit edilir
```

`.env` dosyası depoya dahil değildir ve olmamalıdır.

## Lisans ve künye

MIT.

Işık Üniversitesi IT&MIS Kulübü — blockchain dersi dönem projesi.
