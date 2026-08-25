import { describe, it, expect } from 'vitest';
import { slugify } from './slug';

describe('slugify', () => {
  it('Türkçe karakterleri Latin karşılıklarına çevirir', () => {
    // Regresyon testi: title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    // Türkçe karakterleri tire yapmadan siliyordu, örn. "Gerçek Tarayıcı
    // Testi Yazısı" -> "ger-ek-taray-c-testi-yaz-s-" olup 404'e yol
    // açıyordu (bkz. commit f2c11ce).
    expect(slugify('Gerçek Tarayıcı Testi Yazısı')).toBe(
      'gercek-tarayici-testi-yazisi'
    );
    expect(slugify('Değişim ve Şeffaflık')).toBe('degisim-ve-seffaflik');
    expect(slugify('İstanbul Ünlüler Öğrenci')).toBe(
      'istanbul-unluler-ogrenci'
    );
  });

  it('ASCII olmayan/özel karakterleri tire yapar', () => {
    expect(slugify('Web3 & PoP 101')).toBe('web3-pop-101');
    expect(slugify('DeFi ve Kripto Finansı')).toBe('defi-ve-kripto-finansi');
  });

  it('baştaki ve sondaki tireleri temizler', () => {
    expect(slugify('!!!Merhaba!!!')).toBe('merhaba');
  });

  it('ardışık boşluk/özel karakterleri tek tireye indirger', () => {
    expect(slugify('a   b---c')).toBe('a-b-c');
  });

  it('zaten küçük harf ve tireli bir metni değiştirmeden bırakır', () => {
    expect(slugify('already-a-slug')).toBe('already-a-slug');
  });
});
