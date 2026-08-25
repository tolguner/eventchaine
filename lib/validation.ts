const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ContactFormInput {
  name?: string;
  email?: string;
  message?: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  data?: { name: string; email: string; message: string };
}

/**
 * İletişim formu girdisini doğrular. Alanları trim'ler; boşsa veya e-posta
 * formatı geçersizse hata döner.
 */
export function validateContactForm(input: ContactFormInput): ValidationResult {
  const name = (input.name || '').trim();
  const email = (input.email || '').trim();
  const message = (input.message || '').trim();

  if (!name || !email || !message) {
    return { valid: false, error: 'Ad, e-posta ve mesaj zorunludur' };
  }

  if (!EMAIL_RE.test(email)) {
    return { valid: false, error: 'Geçersiz e-posta adresi' };
  }

  return { valid: true, data: { name, email, message } };
}
