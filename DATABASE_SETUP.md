# Veritabanı Kurulum Kılavuzu

## 📌 Özet

EventChaine platformu artık **gerçek bir veritabanı** kullanıyor! In-memory storage yerine **Prisma ORM** + **SQLite** (development) entegrasyonu yapıldı. Production için PostgreSQL kullanabilirsiniz.

## 🗄️ Mevcut Yapı

### Development (SQLite)
- **Veritabanı:** `prisma/dev.db` (dosya tabanlı, `DATABASE_URL="file:./dev.db"` — yol şemaya göre çözülür)
- **ORM:** Prisma
- **Avantajlar:** 
  - Kolay kurulum
  - Dosya tabanlı (başka bir servis gerekmez)
  - Server restart'ta veri kaybı yok
- **Dezavantajlar:**
  - Production için uygun değil
  - Concurrent connections sınırlı

### Database Schema

```prisma
- User (kullanıcılar)
  - id, name, email, password
  - walletAddress, student_no, department, class_year
  - role (admin/user)
  - Relations: sessions, events, registrations, certificates

- Session (oturum yönetimi)
  - token, user_id, expires_at
  - Auto-cleanup için expires_at kullanılıyor

- Event (etkinlikler)
  - title, slug, description
  - start_at, end_at, location, capacity
  - price, currency, tags (JSON string)
  - Relations: registrations, checkIns, certificates

- Registration (kayıtlar)
  - user_id, event_id
  - ticket_code, qr_payload
  - payment_tx_hash, payment_amount

- Certificate (sertifikalar)
  - user_id, event_id
  - certificate_no, ipfs_cid
  - chain, contract_address, token_id
  - minted_at, revoked_at

- CheckIn (yoklama)
  - user_id, event_id
  - method (qr/beacon), device_hash
  - checkin_at, verifier_id

- BlogPost (blog yazıları)
  - title, slug, excerpt, content
  - category, author
```

## 🚀 Kullanılan Dosyalar

### 1. Prisma Schema
**Dosya:** `prisma/schema.prisma`
- Tüm database modelleri burada
- SQLite kullanıyor (provider = "sqlite")

### 2. Prisma Client
**Dosya:** `lib/prisma.ts`
- Singleton pattern ile Prisma client
- Development'ta connection pooling
- Hot reload sırasında yeni instance oluşturmaz

### 3. Seed Data
**Dosya:** `prisma/seed.ts`
- İlk verileri yükler (admin user, events, blog)
- Komut: `npm run db:seed`

### 4. API Routes (Güncel)
- `app/api/auth/wallet/route.ts` - Wallet authentication
- `app/api/me/profile/route.ts` - Profile GET/PUT
- `app/api/events/route.ts` - Events GET/POST

## 📝 Prisma Komutları

```bash
# Migration oluştur ve uygula
npx prisma migrate dev --name migration_name

# Database'i schema ile senkronize et (migration olmadan)
npx prisma db push

# Prisma Client'ı yeniden oluştur
npx prisma generate

# Seed data'yı yükle
npm run db:seed

# Database'i sıfırla ve seed'i çalıştır
npx prisma migrate reset

# Prisma Studio (GUI) aç
npx prisma studio
```

## 🌐 Production: PostgreSQL Kurulumu

### Seçenek 1: Supabase (Önerilen - Ücretsiz)

1. https://supabase.com adresine git
2. Yeni proje oluştur
3. Settings > Database'den connection string'i al
4. `.env` dosyasını güncelle:

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

5. `prisma/schema.prisma` güncelle:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

6. Migration'ları uygula:
```bash
npx prisma migrate deploy
npm run db:seed
```

### Seçenek 2: Neon (Serverless PostgreSQL)

1. https://neon.tech adresine git
2. Ücretsiz hesap oluştur
3. Connection string'i kopyala
4. `.env` dosyasına ekle:

```env
DATABASE_URL="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb"
```

### Seçenek 3: Railway / Render

1. https://railway.app veya https://render.com
2. PostgreSQL instance oluştur
3. Connection string'i `.env`'e ekle

### Seçenek 4: Local PostgreSQL

```bash
# PostgreSQL indir ve kur
# Windows: https://www.postgresql.org/download/windows/

# .env dosyasında:
DATABASE_URL="postgresql://postgres:password@localhost:5432/eventchaine"

# Database oluştur
psql -U postgres
CREATE DATABASE eventchaine;
\q

# Migration uygula
npx prisma migrate deploy
npm run db:seed
```

## 🔄 Migration Stratejisi

### Development
```bash
# Schema değişikliği yaptığınızda
npx prisma migrate dev --name describe_your_change

# Örnek:
npx prisma migrate dev --name add_user_phone_field
```

### Production
```bash
# Production'da migration uygulamak için
npx prisma migrate deploy
```

## 📊 Prisma Studio ile Yönetim

Database'i GUI üzerinden yönetmek için:

```bash
npx prisma studio
```

- http://localhost:5555 adresinde açılır
- Tüm tabloları görüntüle, düzenle, sil
- Filter ve search yapabilirsin
- Relations'ları takip edebilirsin

## 🔍 Query Örnekleri

### Kullanıcı Bulma
```typescript
const user = await prisma.user.findUnique({
  where: { email: 'user@example.com' },
  include: { sessions: true, registrations: true }
});
```

### Event Listeleme
```typescript
const events = await prisma.event.findMany({
  where: { is_published: true },
  include: { creator: true },
  orderBy: { start_at: 'asc' }
});
```

### Registration Oluşturma
```typescript
const registration = await prisma.registration.create({
  data: {
    user_id: userId,
    event_id: eventId,
    ticket_code: generateTicketCode(),
    qr_payload: generateQRPayload(),
    status: 'confirmed'
  }
});
```

## ⚠️ Önemli Notlar

### Session Temizliği
Session'lar `expires_at` field'ına sahip. Production'da periyodik olarak eski session'ları temizlemek için:

```typescript
// Örnek cron job
await prisma.session.deleteMany({
  where: {
    expires_at: { lt: new Date() }
  }
});
```

### Tags Field'ı
Event `tags` field'ı JSON string olarak saklanıyor (SQLite array desteklemediği için):

```typescript
// Kaydetme
tags: JSON.stringify(['Workshop', 'Blockchain'])

// Okuma
const event = await prisma.event.findUnique({ where: { id } });
const tags = JSON.parse(event.tags); // ['Workshop', 'Blockchain']
```

PostgreSQL kullanırsanız, schema'yı şöyle güncelleyebilirsiniz:
```prisma
tags  String[]  // Array olarak
```

### Email Unique Constraint
Wallet kullanıcıları için temporary email oluşturuluyor:
```typescript
email: `wallet_${address.slice(0, 8)}@temp.com`
```

Profil güncellerken gerçek email kontrolü yapılıyor.

## 🛠️ Sorun Giderme

### "Table does not exist" Hatası
```bash
npx prisma db push
# veya
npx prisma migrate reset --force
```

### Prisma Client Güncel Değil
```bash
npx prisma generate
```

### Migration Çakışması
```bash
# Local migration'ları temizle
rm -rf prisma/migrations
npx prisma migrate dev --name init
```

### Dev.db Kilit Hatası
```bash
# SQLite dosyasını sil ve yeniden oluştur
rm prisma/dev.db
npx prisma db push
npm run db:seed
```

## 📈 Performans İyileştirmeleri

### Connection Pooling (PostgreSQL)
`.env` dosyasına ekle:
```env
DATABASE_URL="postgresql://...?connection_limit=10&pool_timeout=20"
```

### Indexler
Schema'da zaten tanımlı:
- `@@index([slug])` - Events, BlogPosts
- `@@index([token])` - Sessions
- `@@unique([walletAddress])` - Users

### Query Optimization
```typescript
// Sadece ihtiyacınız olan field'ları seçin
const users = await prisma.user.findMany({
  select: { id: true, name: true, email: true }
});

// Relations'ı sadece gerektiğinde include edin
const event = await prisma.event.findUnique({
  where: { id },
  include: { registrations: { take: 100 } }
});
```

## 🎯 Sonraki Adımlar

1. ✅ SQLite veritabanı hazır (development)
2. 🔄 Production için PostgreSQL kurulumu
3. 🔄 Kalan API route'larını güncelle (certificates, registrations, vb.)
4. 🔄 Session cleanup cron job ekle
5. 🔄 Database backup stratejisi belirle
6. 🔄 Migration rollback planı oluştur

## 📚 Kaynaklar

- [Prisma Docs](https://www.prisma.io/docs)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [SQLite vs PostgreSQL](https://www.prisma.io/docs/concepts/database-connectors/sqlite)
- [Next.js + Prisma](https://www.prisma.io/nextjs)

---

**Not:** SQLite development için mükemmel ama production'da PostgreSQL kullanmanızı öneririm. Supabase'in ücretsiz tier'ı 500MB PostgreSQL sunuyor ve kurulumu çok kolay!
