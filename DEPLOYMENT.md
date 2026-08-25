# Blockchain Deployment Rehberi

> **Bu bir yol haritasıdır, tamamlanmış bir kurulumun kaydı değil.** Aşağıdaki
> adımlar proje kapsamında **uygulanmadı**: ne SUI Move modülü ne de Polygon
> kontratı deploy edildi. Projenin blockchain tarafında bugün nelerin gerçek,
> nelerin simülasyon olduğu için [README](./README.md#blockchain-entegrasyonunun-gerçek-durumu)
> bölümüne bakın. Sertifikaların gerçek NFT olarak mint edilmesi için 4. adımdaki
> Move modülünün deploy edilmesi gerekir.

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

`contracts/ProofOfPresenceSBT.sol` derleniyor ve `scripts/deploy.js` mevcut;
aşağıdaki adımlar gerçek bir cüzdan ve test MATIC ile çalışır.

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

## 4️⃣ SUI Move Package Deploy

Modülün kaynak kodu ve testleri depoda hazır: `sui/proof_of_presence/`. `mint`
fonksiyonunun argüman sırası `lib/suiNFT.ts`'teki `moveCall` çağrısıyla
birebir eşleşiyor: `(recipient, event_title, participant_name, event_date,
certificate_no, metadata_url)`. Sertifika nesnesinde `store` yeteneği yok;
bu yüzden mint sonrası hiçbir adrese transfer edilemez (soulbound).

### Gereksinimler
```bash
# Sui CLI (Windows'ta hazır derlenmiş sürüm indirilebilir)
# https://docs.sui.io/guides/developer/getting-started/sui-install
sui --version

sui client active-env      # testnet olmalı
sui client active-address  # deploy edecek adres
```

Deploy eden adreste testnet SUI olmalı (bkz. 2. adımdaki faucet).

### Test

```bash
cd sui/proof_of_presence
sui move test
```

`mints_certificate_to_recipient` testi, mint sonrası sertifikanın alıcının
adresine geçtiğini zincire çıkmadan doğrular.

### Package Deploy

```bash
cd sui/proof_of_presence
sui client publish --gas-budget 100000000
```

Çıktıdaki `Published Objects` bölümünde `PackageID` olarak listelenen değeri
kopyalayıp `.env`'e yazın:

```bash
NEXT_PUBLIC_SUI_PACKAGE_ID="0xPACKAGE_ID_HERE"
```

Bu adımdan sonra `npm run dev` yeniden başlatılmalı; admin panelindeki
"Sertifika Dağıt" artık demo transaction yerine gerçek `mint` çağrısı
gönderir.

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
   - Giriş yalnızca cüzdanla yapılır; e-posta/şifre ile giriş yoktur.
   - Cüzdanı bağladıktan sonra `/profile` sayfasından e-postanızı
     `app/api/auth/wallet` içindeki `ADMIN_EMAILS` listesindeki adresle
     değiştirin, çıkıp yeniden bağlanın; rolünüz `admin` olur.
   - `/admin` sayfasına gidin

3. **NFT Mint Test**
   - Admin panelinde "Etkinlikler" sekmesine gidin
   - Bir etkinlik seçin
   - "Sertifika Dağıt" butonuna tıklayın
   - Cüzdan bağlı olmalı!
   - Transaction'ı onaylayın
   - TX hash'i console'da görünecek
   - ⚠️ `NEXT_PUBLIC_SUI_PACKAGE_ID` hâlâ `0x0` ise gerçek bir NFT mint
     edilmez; alıcıya 1 MIST gönderen bir demo transaction imzalanır.
     Gerçek mint için önce 4. adımdaki Move modülü deploy edilmelidir.

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

Bu listedeki adımların tamamı uygulandığında sertifikalar gerçek Soulbound
NFT olarak mint edilir. Projenin teslim edildiği hâlde bu adımlar tamamlanmamıştır.
