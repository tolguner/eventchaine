/**
 * GERÇEK BLOCKCHAIN İŞLEMLERİ İÇİN DEPLOYMENT REHBERİ
 * Bu adımları takip ederek projeyi tam bir Web3 uygulamasına dönüştürün
 */

# 🚀 Blockchain Deployment Rehberi

## 1️⃣ Environment Variables Ayarlama

### .env Dosyası Oluşturun
```bash
cp .env.example .env
```

### Gerekli Değerleri Doldurun:

1. **SUI Network**
   - Testnet için: `NEXT_PUBLIC_SUI_NETWORK="testnet"`
   - Mainnet için: `NEXT_PUBLIC_SUI_NETWORK="mainnet"`

2. **NFT Storage API Key** (Ücretsiz)
   - https://nft.storage adresine gidin
   - Ücretsiz hesap oluşturun
   - API key alın
   - `.env` dosyasına ekleyin:
   ```
   NFT_STORAGE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   ```

3. **Platform Wallet Address**
   - Admin cüzdanınızın adresini girin
   - Tüm ödemeler bu cüzdana gelecek

## 2️⃣ SUI Cüzdan Hazırlığı

### Sui Wallet Kurulumu
1. Chrome'a Sui Wallet extension yükleyin: https://chrome.google.com/webstore/detail/sui-wallet/
2. Yeni cüzdan oluşturun veya mevcut cüzdanı import edin
3. **Testnet'e geçin** (Settings → Network → Sui Testnet)

### Test SUI Alma (Faucet)
```bash
# Testnet için ücretsiz SUI alın
# https://discord.gg/sui adresine gidin
# #testnet-faucet kanalında cüzdan adresinizi paylaşın
```

Veya komut satırından:
```bash
curl --location --request POST 'https://faucet.testnet.sui.io/gas' \
--header 'Content-Type: application/json' \
--data-raw '{
    "FixedAmountRequest": {
        "recipient": "CUZDAN_ADRESINIZ"
    }
}'
```

## 3️⃣ Polygon Smart Contract Deploy (Opsiyonel)

### Gereksinimler
- MetaMask cüzdanı
- Polygon Mumbai test MATIC (https://mumbaifaucet.com/)
- Private key (MetaMask'ten export edin)

### Deploy Adımları

1. **Private Key'i .env'e Ekleyin**
```bash
PRIVATE_KEY="your-private-key-without-0x-prefix"
```

2. **Contract'ı Compile Edin**
```bash
npx hardhat compile
```

3. **Mumbai Testnet'e Deploy Edin**
```bash
npx hardhat run scripts/deploy.js --network polygonMumbai
```

4. **Contract Adresini Kaydedin**
Deploy sonrası çıktıda gösterilen adresi `.env` dosyasına ekleyin:
```bash
NEXT_PUBLIC_POLYGON_CONTRACT_ADDRESS="0x..."
NEXT_PUBLIC_POLYGON_CHAIN_ID="80001"
```

5. **Contract'ı Doğrulayın** (Opsiyonel)
```bash
npx hardhat verify --network polygonMumbai CONTRACT_ADDRESS
```

## 4️⃣ SUI Move Package Deploy (Gelişmiş)

SUI blockchain'de NFT contract deploy etmek için:

### Gereksinimler
```bash
# Sui CLI yükleyin
cargo install --locked --git https://github.com/MystenLabs/sui.git --branch mainnet sui
```

### Move Module Oluşturun

`sui_modules/proof_of_presence/sources/certificate.move`:

```move
module proof_of_presence::certificate {
    use std::string::{Self, String};
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    
    /// Soulbound NFT - Transfer edilemez
    struct Certificate has key {
        id: UID,
        name: String,
        description: String,
        event_title: String,
        participant_name: String,
        event_date: String,
        certificate_no: String,
        image_url: String,
        is_soulbound: bool,
    }
    
    /// Certificate mint fonksiyonu
    public entry fun mint(
        recipient: address,
        event_title: vector<u8>,
        participant_name: vector<u8>,
        event_date: vector<u8>,
        certificate_no: vector<u8>,
        image_url: vector<u8>,
        ctx: &mut TxContext
    ) {
        let certificate = Certificate {
            id: object::new(ctx),
            name: string::utf8(b"Proof of Presence Certificate"),
            description: string::utf8(b"Event attendance certificate"),
            event_title: string::utf8(event_title),
            participant_name: string::utf8(participant_name),
            event_date: string::utf8(event_date),
            certificate_no: string::utf8(certificate_no),
            image_url: string::utf8(image_url),
            is_soulbound: true,
        };
        
        // Soulbound - sadece recipient'a transfer
        transfer::transfer(certificate, recipient);
    }
}
```

### Package Deploy
```bash
# Testnet'e deploy
sui client publish --gas-budget 100000000

# Package ID'yi not alın ve .env'e ekleyin
NEXT_PUBLIC_SUI_PACKAGE_ID="0xPACKAGE_ID_HERE"
```

## 5️⃣ Uygulamayı Test Edin

### Development Server'ı Başlatın
```bash
npm run dev
```

### Test Senaryoları

1. **Cüzdan Bağlama**
   - http://localhost:3000
   - Header'daki "Connect Wallet" butonuna tıklayın
   - Sui Wallet'ı seçin ve bağlayın

2. **Admin Paneli**
   - Admin hesabıyla giriş yapın: tolgaolguner1@gmail.com / tolga123
   - `/admin` sayfasına gidin

3. **Gerçek NFT Mint Test**
   - Admin panelinde "Etkinlikler" sekmesine gidin
   - Bir etkinlik seçin
   - "Sertifika Dağıt" butonuna tıklayın
   - Cüzdan bağlı olmalı!
   - Transaction'ı onaylayın
   - ✅ TX hash'i console'da görünecek

4. **Blockchain Explorer'da Doğrulama**
   - Console'da görünen TX hash'i kopyalayın
   - https://suiscan.xyz/testnet/tx/TX_HASH adresine gidin
   - Transaction detaylarını görün

5. **Ödeme Testi** (Ücretli Etkinlik)
   - Ücretli bir etkinliğe kayıt olun
   - Ödeme işlemini onaylayın
   - Gerçek SUI transfer edilecek!

## 6️⃣ Production Deployment

### Vercel'e Deploy

1. **GitHub'a Push**
```bash
git add .
git commit -m "Add real blockchain integration"
git push origin main
```

2. **Vercel'e Bağla**
   - https://vercel.com adresine gidin
   - GitHub repo'nuzu bağlayın
   - Environment variables'ı ekleyin (.env.example'dan)

3. **Build Settings**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

4. **Environment Variables (Vercel)**
```
DATABASE_URL=file:./dev.db
NEXT_PUBLIC_SUI_NETWORK=testnet
NEXT_PUBLIC_SUI_PACKAGE_ID=0x...
NFT_STORAGE_KEY=eyJ...
NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS=0x...
```

5. **Deploy**
   - "Deploy" butonuna tıklayın
   - 2-3 dakika bekleyin
   - ✅ Production URL'iniz hazır!

## 📊 İzleme ve Debugging

### Transaction Logları
```javascript
// Browser console'da:
console.log('Transaction result:', result);
console.log('Explorer URL:', explorerUrl);
```

### Blockchain Explorer
- **SUI Testnet**: https://suiscan.xyz/testnet
- **SUI Mainnet**: https://suiscan.xyz/mainnet
- **Polygon Mumbai**: https://mumbai.polygonscan.com

### Hata Ayıklama
```bash
# Cüzdan bakiyesi kontrolü
# Sui Wallet → Settings → Account Details

# Console loglarını takip edin
# Browser DevTools → Console

# Network isteklerini izleyin
# Browser DevTools → Network
```

## ⚠️ Önemli Notlar

1. **Testnet vs Mainnet**
   - Önce testnet'te test edin
   - Mainnet'te gerçek para harcanır!

2. **Gas Fees**
   - Her transaction gas ücreti gerektirir
   - SUI testnet için ücretsiz faucet var
   - Mainnet için gerçek SUI satın alın

3. **Private Keys**
   - Asla private key'leri GitHub'a push etmeyin
   - `.env` dosyası `.gitignore`'da olmalı
   - Production'da Vercel secrets kullanın

4. **Rate Limiting**
   - Batch mint için delay eklenmiş (2 saniye)
   - Çok hızlı istek spam'i yapma

5. **Backup**
   - Seed phrase'leri güvenli yerde saklayın
   - Private key'leri yedekleyin

## 🎉 Başarı Kontrol Listesi

- [ ] .env dosyası yapılandırıldı
- [ ] Sui Wallet yüklendi ve testnet'e geçildi
- [ ] Test SUI alındı (faucet)
- [ ] NFT.Storage API key alındı
- [ ] Smart contract deploy edildi (opsiyonel)
- [ ] Cüzdan başarıyla bağlandı
- [ ] İlk NFT mint edildi
- [ ] Transaction blockchain'de görüldü
- [ ] Ödeme işlemi test edildi
- [ ] Production'a deploy edildi

## 📚 Kaynaklar

- **SUI Docs**: https://docs.sui.io
- **SUI TypeScript SDK**: https://sdk.mystenlabs.com/typescript
- **NFT.Storage**: https://nft.storage
- **Hardhat**: https://hardhat.org/docs
- **Vercel**: https://vercel.com/docs

---

**Tebrikler! 🎉**
Artık tam fonksiyonel bir Web3 uygulamanız var!
