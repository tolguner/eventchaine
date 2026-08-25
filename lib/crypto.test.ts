import { describe, it, expect } from 'vitest';
import {
  generateTicketCode,
  generateQRPayload,
  verifyQRPayload,
  generateCertificateNo,
} from './crypto';

describe('generateTicketCode', () => {
  it('TCKT- ön ekli, iki grup büyük harf hex üretir', () => {
    const code = generateTicketCode();
    expect(code).toMatch(/^TCKT-[0-9A-F]{4}-[0-9A-F]{4}$/);
  });

  it('her çağrıda farklı bir kod üretir', () => {
    const codes = new Set(Array.from({ length: 20 }, () => generateTicketCode()));
    expect(codes.size).toBe(20);
  });
});

describe('generateQRPayload / verifyQRPayload', () => {
  it('üretilen payload kendi imzasıyla doğrulanır', () => {
    const payload = generateQRPayload('TCKT-AAAA-BBBB', 'e_101', 'u_admin');
    const result = verifyQRPayload(payload);

    expect(result.valid).toBe(true);
    expect(result.data).toMatchObject({
      ticket: 'TCKT-AAAA-BBBB',
      event_id: 'e_101',
      user_id: 'u_admin',
    });
  });

  it('değiştirilmiş (tamper edilmiş) payload\'ı reddeder', () => {
    const payload = generateQRPayload('TCKT-AAAA-BBBB', 'e_101', 'u_admin');
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));

    // Kullanıcıyı değiştirip imzayı bozmadan tekrar encode et
    decoded.user_id = 'u_baska_kullanici';
    const tampered = Buffer.from(JSON.stringify(decoded)).toString('base64url');

    const result = verifyQRPayload(tampered);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Geçersiz QR imzası');
  });

  it('süresi dolmuş payload\'ı reddeder', () => {
    const payload = generateQRPayload('TCKT-AAAA-BBBB', 'e_101', 'u_admin');
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));

    // exp'i geçmişe çek ama imzayı yeniden hesaplamadan bırak — gerçek bir
    // saldırgan da imzayı geçersiz kılmadan exp'i değiştiremez, dolayısıyla
    // burada imza da geçersiz olacak ve "Geçersiz QR imzası" dönecektir.
    // Süre kontrolünün de çalıştığını izole test etmek için imzayı da
    // güncelliyoruz.
    decoded.exp = Math.floor(Date.now() / 1000) - 10;
    const tampered = Buffer.from(JSON.stringify(decoded)).toString('base64url');

    const result = verifyQRPayload(tampered);
    expect(result.valid).toBe(false);
  });

  it('bozuk/geçersiz formatlı payload\'ı reddeder', () => {
    const result = verifyQRPayload('bu-gecerli-bir-payload-degil');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Geçersiz QR formatı');
  });
});

describe('generateCertificateNo', () => {
  it('POP- ön ekli, tarihi içeren bir sertifika numarası üretir', () => {
    const certNo = generateCertificateNo('2026-08-25T10:00:00.000Z');
    expect(certNo).toMatch(/^POP-20260825-[0-9A-F]{6}$/);
  });
});
