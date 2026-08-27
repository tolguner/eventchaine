import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    // tsconfig.json'daki "@/*": ["./*"] eşlemesinin vitest karşılığı
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  // React bileşen testleri için JSX dönüşümü. @vitejs/plugin-react
  // kurulmuyor çünkü gerektirdiği vite sürümü hardhat bağımlılıklarıyla
  // çakışıp toolchain'i bozuyor; JSX'i doğrudan transformer'a bildirmek
  // yeterli.
  // tsconfig.json Next.js için "jsx": "preserve" kullanıyor; test
  // transformer'ı (vitest 4 -> rolldown/oxc) JSX'i dönüştürebilsin diye
  // burada override ediliyor.
  oxc: {
    jsx: { runtime: 'automatic' },
  },
  test: {
    include: ['**/*.test.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'sui/**'],
    // Varsayılan node; React bileşen testleri kendi dosyalarında
    // `@vitest-environment jsdom` ile jsdom'a geçer.
    environment: 'node',
    // API route testleri gerçek bir Prisma/SQLite veritabanına yazıyor;
    // dev.db'yi kirletmemek için ayrı bir test.db'ye yönlendirilir
    // (bkz. vitest.global-setup.ts).
    env: {
      DATABASE_URL: 'file:./test.db',
    },
    globalSetup: './vitest.global-setup.ts',
    // Testler aynı SQLite dosyasını paylaştığı için dosyalar sırayla
    // çalışmalı; paralel çalışırsa birbirlerinin verisini siliyorlar.
    fileParallelism: false,
  },
});
