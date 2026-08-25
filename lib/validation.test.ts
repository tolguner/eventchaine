import { describe, it, expect } from 'vitest';
import { validateContactForm } from './validation';

describe('validateContactForm', () => {
  it('geçerli girdiyi kabul eder ve alanları trim\'ler', () => {
    const result = validateContactForm({
      name: '  Test Kullanıcı  ',
      email: ' test@example.com ',
      message: '  Merhaba  ',
    });

    expect(result.valid).toBe(true);
    expect(result.data).toEqual({
      name: 'Test Kullanıcı',
      email: 'test@example.com',
      message: 'Merhaba',
    });
  });

  it.each(['name', 'email', 'message'] as const)(
    'boş %s alanını reddeder',
    (field) => {
      const input = { name: 'X', email: 'x@example.com', message: 'msg', [field]: '' };
      const result = validateContactForm(input);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Ad, e-posta ve mesaj zorunludur');
    }
  );

  it('sadece boşluktan oluşan alanları boş sayar', () => {
    const result = validateContactForm({ name: '   ', email: 'x@example.com', message: 'msg' });
    expect(result.valid).toBe(false);
  });

  it.each(['gecersiz', 'a@b', '@example.com', 'a@.com', 'a b@example.com'])(
    'geçersiz e-posta formatını (%s) reddeder',
    (email) => {
      const result = validateContactForm({ name: 'X', email, message: 'msg' });
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Geçersiz e-posta adresi');
    }
  );

  it('alanlar hiç gönderilmediğinde de reddeder', () => {
    const result = validateContactForm({});
    expect(result.valid).toBe(false);
  });
});
