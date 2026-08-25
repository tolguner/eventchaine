# Blockchain Deployment Rehberi

> **Hem SUI Move modülü (4. adım) hem Polygon kontratı (3. adım) testnet'e
> yayınlandı**, adresler `.env.example`'da tanımlı — hiçbir şey deploy
> etmeden gerçek NFT mint (SUI, ana zincir) ve opsiyonel EVM kontratını
> (Polygon Amoy) deneyebilirsiniz. Bugün nelerin gerçek, nelerin simülasyon
> olduğu için [README](./README.md#blockchain-entegrasyonunun-gerçek-durumu)
> bölümüne bakın.

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

`contracts/ProofOfPresenceSBT.sol` derleniyor ve `scripts/deploy.js` mevcut.
**Mumbai testnet Nisan 2024'te kapatıldı** — proje bunun yerine **Polygon
Amoy**'u kullanıyor (`hardhat.config.ts`'teki `polygonAmoy` ağı, chain ID
80002).

### Zaten yayınlanmış bir kontrat var

```
Adres:    0xc3DF1D336724616354f639f5e70367eB70E76806
Ağ:       Polygon Amoy (chain ID 80002)
Explorer: https://amoy.polygonscan.com/address/0xc3DF1D336724616354f639f5e70367eB70E76806
```

`.env.example`'daki `NEXT_PUBLIC_POLYGON_CONTRACT_ADDRESS` bu adresi
varsayılan olarak taşıyor. Kontratın `MINTER_ROLE`/`ADMIN_ROLE` yetkisi
yalnızca onu deploy eden cüzdanda olduğu için, `mint`/`revoke` gibi
fonksiyonları çağırmak isterseniz kendi kontratınızı deploy etmeniz gerekir
(salt okunur çağrılar — `tokenURI`, `totalSupply`, `locked` — herkese açıktır).

### Kendi kontratınızı deploy etmek için

1. **`.env`'e RPC ve private key ekleyin**

   Varsayılan `POLYGON_AMOY_RPC` (`rpc-amoy.polygon.technology`) bazı
   ağlarda DNS çözümlemiyor; çözmüyorsa alternatif bir sağlayıcı kullanın:
   ```bash
   POLYGON_AMOY_RPC="https://polygon-amoy-bor-rpc.publicnode.com"
   PRIVATE_KEY="0x ön eki olmadan private key"
   ```
   > `hardhat.config.ts` `dotenv/config` import ediyor; `.env`'deki
   > değişiklikler her çalıştırmada otomatik yüklenir.

2. **Test MATIC (POL) alın**

   https://faucet.polygon.technology → ağ olarak **Polygon Amoy**, token
   olarak **POL** seçin, cüzdan adresinizi girin. CAPTCHA/hesap doğrulaması
   isteyebilir.

3. **Deploy edin**
   ```bash
   npx hardhat run scripts/deploy.js --network polygonAmoy
   ```

4. **Contract adresini kaydedin**
   Çıktıda gösterilen adresi `.env`'e yazın:
   ```bash
   NEXT_PUBLIC_POLYGON_CONTRACT_ADDRESS="0x..."
   NEXT_PUBLIC_POLYGON_CHAIN_ID="80002"
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

### Zaten yayınlanmış bir paket var

Bu modül testnet'e yayınlandı ve `.env.example`'da varsayılan olarak
tanımlı:

```
Package ID:  0x0136e1afed0943d3efdb48c44db170131512b5695daa4456b635844ef7b0c190
AdminCap ID: 0x8857320579ace3847330a41773214738cc8c20eeaa29c3640180d215d018c1ff
Ağ:          testnet
Explorer:    https://suiscan.xyz/testnet/object/0x0136e1afed0943d3efdb48c44db170131512b5695daa4456b635844ef7b0c190
```

`mint` fonksiyonu bir `AdminCap` nesnesi ister; bu nesne yalnızca paketi
yayınlayan cüzdanda bulunur. Bu yüzden yukarıdaki AdminCap ID **yalnızca o
cüzdanla** (deploy'u yapan adres) çalışır — kendi admin cüzdanınızla gerçek
mint yapmak isterseniz kendi paketinizi deploy etmeniz gerekir; o durumda
`init()` yeni bir `AdminCap`'i sizin cüzdanınıza gönderir.

Kendi paketinizi deploy etmek için yukarıdaki adımları izleyin, ardından:

```bash
sui client objects --owned-by <adresiniz>   # yeni AdminCap'in ID'sini bulun
```

çıktısındaki `proof_of_presence::AdminCap` nesnesinin ID'sini
`NEXT_PUBLIC_SUI_ADMIN_CAP_ID`'ye, paket ID'sini `NEXT_PUBLIC_SUI_PACKAGE_ID`'ye
yazın.

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
   - `NEXT_PUBLIC_SUI_PACKAGE_ID` `.env.example`'daki varsayılan değeri
     kullanıyorsa (ya da boş bırakılmadıysa) bu gerçek bir mint'tir. `0x0`
     yaparsanız alıcıya 1 MIST gönderen bir demo transaction'a düşer.

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
- **Polygon Amoy**: https://amoy.polygonscan.com

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

SUI (ana zincir) ve Polygon (opsiyonel) taraflarının ikisi de testnet'e
yayınlandı; sertifikalar `.env.example`'daki varsayılan yapılandırmayla
gerçek Soulbound NFT olarak mint ediliyor. Kendi paketinizi/kontratınızı
deploy etmek isterseniz 3. ve 4. adımlardaki komutları izleyin.
