# 🎨 EventChain Renk Paleti

## 🌈 Ana Renkler

### Primary Orange (Accent Primary)
- **HEX**: `#fa9e0f`
- **RGB**: `rgb(250, 158, 15)`
- **HSL**: `hsl(33, 96%, 52%)`
- **Kullanım**: Ana vurgu rengi, butonlar, linkler, öne çıkan elementler
- **CSS**: `var(--accent-primary)`

### Secondary Blue (Accent Secondary)
- **HEX**: `#0346b9`
- **RGB**: `rgb(3, 70, 185)`
- **HSL**: `hsl(218, 97%, 37%)`
- **Kullanım**: İkincil vurgu rengi, gradient'ler, hover states
- **CSS**: `var(--accent-secondary)`

---

## 🌗 Light Theme (Varsayılan)

### Arka Plan Renkleri
```css
--bg-primary: #FFFFFF       /* Ana arka plan (Beyaz) */
--bg-secondary: #F8FAFC     /* İkincil arka plan (Açık Gri) */
--bg-tertiary: #F1F5F9      /* Üçüncül arka plan (Daha Koyu Gri) */
```

| Renk | HEX | RGB | Önizleme |
|------|-----|-----|----------|
| Primary BG | `#FFFFFF` | `rgb(255, 255, 255)` | ![#FFFFFF](https://via.placeholder.com/50x30/FFFFFF/000000?text=+) |
| Secondary BG | `#F8FAFC` | `rgb(248, 250, 252)` | ![#F8FAFC](https://via.placeholder.com/50x30/F8FAFC/000000?text=+) |
| Tertiary BG | `#F1F5F9` | `rgb(241, 245, 249)` | ![#F1F5F9](https://via.placeholder.com/50x30/F1F5F9/000000?text=+) |

### Text Renkleri
```css
--text-primary: #0F172A     /* Ana metin (Koyu Gri) */
--text-secondary: #475569   /* İkincil metin (Orta Gri) */
--text-tertiary: #94A3B8    /* Üçüncül metin (Açık Gri) */
```

| Renk | HEX | RGB | Önizleme |
|------|-----|-----|----------|
| Primary Text | `#0F172A` | `rgb(15, 23, 42)` | ![#0F172A](https://via.placeholder.com/50x30/0F172A/FFFFFF?text=+) |
| Secondary Text | `#475569` | `rgb(71, 85, 105)` | ![#475569](https://via.placeholder.com/50x30/475569/FFFFFF?text=+) |
| Tertiary Text | `#94A3B8` | `rgb(148, 163, 184)` | ![#94A3B8](https://via.placeholder.com/50x30/94A3B8/000000?text=+) |

### Border Renkleri
```css
--border-primary: #E2E8F0   /* Ana border (Açık Gri) */
--border-secondary: #CBD5E1 /* İkincil border (Orta Gri) */
```

| Renk | HEX | RGB | Önizleme |
|------|-----|-----|----------|
| Primary Border | `#E2E8F0` | `rgb(226, 232, 240)` | ![#E2E8F0](https://via.placeholder.com/50x30/E2E8F0/000000?text=+) |
| Secondary Border | `#CBD5E1` | `rgb(203, 213, 225)` | ![#CBD5E1](https://via.placeholder.com/50x30/CBD5E1/000000?text=+) |

---

## 🌙 Dark Theme

### Arka Plan Renkleri
```css
--bg-primary: #1E293B       /* Ana arka plan (Koyu Mavi-Gri) */
--bg-secondary: #0F172A     /* İkincil arka plan (Çok Koyu) */
--bg-tertiary: #334155      /* Üçüncül arka plan (Orta Koyu) */
```

| Renk | HEX | RGB | Önizleme |
|------|-----|-----|----------|
| Primary BG | `#1E293B` | `rgb(30, 41, 59)` | ![#1E293B](https://via.placeholder.com/50x30/1E293B/FFFFFF?text=+) |
| Secondary BG | `#0F172A` | `rgb(15, 23, 42)` | ![#0F172A](https://via.placeholder.com/50x30/0F172A/FFFFFF?text=+) |
| Tertiary BG | `#334155` | `rgb(51, 65, 85)` | ![#334155](https://via.placeholder.com/50x30/334155/FFFFFF?text=+) |

### Text Renkleri
```css
--text-primary: #F8FAFC     /* Ana metin (Beyaz) */
--text-secondary: #CBD5E1   /* İkincil metin (Açık Gri) */
--text-tertiary: #94A3B8    /* Üçüncül metin (Orta Gri) */
```

| Renk | HEX | RGB | Önizleme |
|------|-----|-----|----------|
| Primary Text | `#F8FAFC` | `rgb(248, 250, 252)` | ![#F8FAFC](https://via.placeholder.com/50x30/F8FAFC/000000?text=+) |
| Secondary Text | `#CBD5E1` | `rgb(203, 213, 225)` | ![#CBD5E1](https://via.placeholder.com/50x30/CBD5E1/000000?text=+) |
| Tertiary Text | `#94A3B8` | `rgb(148, 163, 184)` | ![#94A3B8](https://via.placeholder.com/50x30/94A3B8/000000?text=+) |

### Border Renkleri
```css
--border-primary: rgba(250, 158, 15, 0.15)   /* Ana border (Turuncu %15) */
--border-secondary: rgba(250, 158, 15, 0.25) /* İkincil border (Turuncu %25) */
```

---

## 🎨 Gradient & Özel Efektler

### Accent Gradient
```css
--accent-gradient: linear-gradient(135deg, #fa9e0f, #ff8c42);
```
- **Başlangıç**: `#fa9e0f` (Turuncu)
- **Bitiş**: `#ff8c42` (Açık Turuncu)
- **Açı**: `135deg`
- **Kullanım**: Buton hover, hero sections, premium elementler

### Shadow (Gölge) Seviyeleri

**Light Theme:**
```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05)
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1)
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1)
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1)
```

**Dark Theme:**
```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.5)
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.5)
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.5)
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.5)
```

---

## 🎯 Tailwind CSS Entegrasyonu

### tailwind.config.js
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#0346b9',      // Mavi
        secondary: '#fa9e0f',    // Turuncu
        dark: '#0F172A',
        light: '#F8FAFC',
      },
      gradientColorStops: {
        'gradient-start': '#fa9e0f',
        'gradient-end': '#ff8c42',
      }
    }
  }
}
```

---

## 📊 Kullanım Örnekleri

### Buton
```css
.btn-primary {
  background: var(--accent-primary);
  color: white;
  border-radius: 12px;
  padding: 12px 24px;
}

.btn-primary:hover {
  background: var(--accent-gradient);
}
```

### Card
```css
.card {
  background: var(--bg-primary);
  border: 2px solid var(--border-primary);
  border-radius: 16px;
  box-shadow: var(--shadow-md);
}

.card:hover {
  border-color: var(--accent-primary);
}
```

### Text
```css
.heading {
  color: var(--text-primary);
  font-weight: 700;
}

.description {
  color: var(--text-secondary);
  font-weight: 400;
}
```

---

## 🔧 CSS Variable Kullanımı

Tüm bileşenlerde CSS variables kullanarak tema desteği sağlanır:

```css
/* ✅ Doğru */
color: var(--text-primary);
background: var(--bg-primary);
border-color: var(--border-primary);

/* ❌ Yanlış - Hard-coded renkler */
color: #0F172A;
background: #FFFFFF;
```

---

## 🌐 Accessibility (Erişilebilirlik)

### Kontrast Oranları

| Kombinasyon | Kontrast Oranı | WCAG Uyumluluğu |
|-------------|----------------|-----------------|
| `#0F172A` on `#FFFFFF` | 15.8:1 | AAA ✅ |
| `#475569` on `#FFFFFF` | 7.8:1 | AAA ✅ |
| `#fa9e0f` on `#FFFFFF` | 2.9:1 | AA (Large) ⚠️ |
| `#0346b9` on `#FFFFFF` | 7.1:1 | AAA ✅ |

**Not**: Turuncu renk (`#fa9e0f`) beyaz arka planda sadece büyük metinler için uygundur. Küçük metinlerde koyu arka plan veya border olarak kullanın.

---

## 🎨 Figma / Design Tool Export

### Hex Kodları (Kopyala-Yapıştır)
```
Orange Primary: #fa9e0f
Blue Secondary: #0346b9
Dark BG: #0F172A
Light BG: #FFFFFF
Light Gray: #F8FAFC
Border Gray: #E2E8F0
Text Dark: #0F172A
Text Light: #F8FAFC
```

### RGB Değerleri
```
Orange Primary: rgb(250, 158, 15)
Blue Secondary: rgb(3, 70, 185)
Dark BG: rgb(15, 23, 42)
Light BG: rgb(255, 255, 255)
```

---

## 📱 Platform Specific Colors

### Blockchain Status Colors
```css
.status-success { color: #22C55E; }  /* Yeşil - Onaylandı */
.status-pending { color: #F59E0B; }  /* Sarı - Beklemede */
.status-failed { color: #EF4444; }   /* Kırmızı - Başarısız */
.status-minted { color: #8B5CF6; }   /* Mor - NFT Mint */
```

### Badge Colors
```css
.badge-primary { background: #0346b9; }    /* Mavi */
.badge-secondary { background: #fa9e0f; }  /* Turuncu */
.badge-success { background: #22C55E; }    /* Yeşil */
.badge-warning { background: #F59E0B; }    /* Sarı */
.badge-danger { background: #EF4444; }     /* Kırmızı */
.badge-gray { background: #6B7280; }       /* Gri */
```

---

## 🔄 Theme Switch

Tema değiştirmek için:

```javascript
// Dark mode
document.documentElement.setAttribute('data-theme', 'dark');

// Light mode
document.documentElement.setAttribute('data-theme', 'light');
```

---

**Tasarım Sistemi Versiyonu**: 1.0  
**Son Güncelleme**: 18 Kasım 2025  
**Proje**: EventChain - Web3 Event Platform
