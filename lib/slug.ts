const TR_CHAR_MAP: Record<string, string> = {
  ç: 'c', Ç: 'c',
  ğ: 'g', Ğ: 'g',
  ı: 'i', I: 'i',
  İ: 'i',
  ö: 'o', Ö: 'o',
  ş: 's', Ş: 's',
  ü: 'u', Ü: 'u',
};

/**
 * Başlığı URL-güvenli bir slug'a çevirir. Türkçe karakterleri (ç, ğ, ı, ö,
 * ş, ü) Latin karşılıklarına çevirir; öncesinde bunlar `[^a-z0-9]` filtresi
 * tarafından tamamen siliniyordu (örn. "Gerçek" → "ger-ek"), bu yüzden
 * Türkçe başlıklı içerikler kendi slug'larıyla hiç bulunamıyordu.
 */
export function slugify(title: string): string {
  const ascii = title.replace(/[çÇğĞıIİöÖşŞüÜ]/g, (ch) => TR_CHAR_MAP[ch] ?? ch);

  return ascii
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
