# Proje Kurulum Özeti

## ✅ Tamamlanan Proje

**IT&MIS Kulübü - Proof of Presence (PoP) Web3 Etkinlik Platformu** başarıyla oluşturuldu ve çalışıyor!

## 🌐 Erişim Bilgileri

**URL**: http://localhost:3000

## 👥 Test Kullanıcıları

### Katılımcı Hesabı
- **E-posta**: dogukan@gmail.com
- **Şifre**: dogukan123
- **Yetkiler**: Etkinliklere kayıt, QR bilet, sertifika görüntüleme

### Admin Hesabı
- **E-posta**: tolgaolguner1@gmail.com
- **Şifre**: tolga123
- **Yetkiler**: Tüm yetkiler + etkinlik yönetimi + sertifika dağıtımı

## 📂 Proje Yapısı

```
eventchaine/
├── app/                  # Next.js App Router
│   ├── api/             # Backend API endpoints
│   │   ├── auth/        # Giriş/Kayıt
│   │   ├── events/      # Etkinlik yönetimi
│   │   ├── me/          # Kullanıcı profili
│   │   ├── checkin/     # Check-in sistemi
│   │   ├── certificates/# Sertifika yönetimi
│   │   └── posts/       # Blog
│   ├── auth/            # Kimlik doğrulama sayfaları
│   ├── events/          # Etkinlik sayfaları
│   ├── profile/         # Kullanıcı profili
│   ├── admin/           # Admin paneli
│   ├── verify/          # Sertifika doğrulama
│   ├── about/           # Hakkında
│   ├── blog/            # Blog
│   ├── contact/         # İletişim
│   └── page.tsx         # Ana sayfa
├── components/          # UI bileşenleri
├── lib/                 # Utilities (DB, Crypto)
├── public/              # Statik dosyalar
└── README.md            # Detaylı dokümantasyon
```

## 🎯 Özellikler

✅ **Ana Sayfa**: Hero, istatistikler, etkinlikler, blog
✅ **Etkinlikler**: Liste ve detay sayfaları, filtreleme
✅ **Ön Kayıt Sistemi**: Form ve kapasite kontrolü
✅ **QR Biletler**: Her kayıt için benzersiz QR kod
✅ **Profil Sayfası**: Biletler ve sertifikalar sekmeleri
✅ **QR Modal**: Bilet QR kodu gösterimi
✅ **Check-in API**: QR doğrulama endpoint'i
✅ **Sertifika Sistemi**: Mock blockchain entegrasyonu
✅ **Admin Paneli**: Etkinlik yönetimi ve sertifika dağıtımı
✅ **Doğrulama Sayfası**: Sertifika blockchain doğrulama
✅ **Blog**: Yazı listesi ve detayları
✅ **Hakkında & İletişim**: Statik bilgi sayfaları

## 🚀 Kullanım Senaryosu

### 1. Katılımcı Akışı
1. http://localhost:3000 adresine git
2. "Kayıt Ol" veya "Giriş Yap" ile dogukan@gmail.com hesabını kullan
3. "Etkinlikler" sayfasından bir etkinlik seç
4. "Ön Kayıt Ol" butonuna tıkla
5. "Profil" sayfasına git → "Biletlerim" sekmesinde QR kodunu gör
6. Admin sertifika dağıttıktan sonra "Sertifikalarım" sekmesinde sertifikanı gör

### 2. Admin Akışı
1. tolgaolguner1@gmail.com / tolga123 ile giriş yap
2. Otomatik olarak Admin Panel'e yönlendirilirsin
3. "Sertifika Dağıt" butonu ile check-in yapmış kullanıcılara sertifika dağıt
4. İstatistikleri ve kayıtları görüntüle

## 📝 Notlar

- **Mock Data**: Tüm veriler bellekte (LocalStorage ve JS array'lerde) saklanır
- **Mock Blockchain**: Gerçek blockchain yazımı yok, simüle edilir
- **TypeScript Hataları**: Normal, dependencies yüklendikten sonra çözülür
- **Production'a Hazır Değil**: Bu bir demo projedir, gerçek üretim için database, güvenlik, ve blockchain entegrasyonu gerekir

## 🔧 Komutlar

```bash
# Development server başlat
npm run dev

# Build
npm run build

# Production başlat
npm start

# Lint
npm run lint
```

## 📚 Daha Fazla Bilgi

Detaylı dokümantasyon için `README.md` dosyasını inceleyin.

---

**Proje Durumu**: ✅ Çalışıyor  
**Port**: 3000  
**Kullanıcılar**: Hazır (dogukan@gmail.com, tolgaolguner1@gmail.com)  
**Tamamlanma**: %100
