import { execSync } from 'child_process';
import { existsSync, unlinkSync } from 'fs';
import path from 'path';

// API route testleri gerçek bir SQLite veritabanına yazıyor; geliştirme
// veritabanını (dev.db) kirletmemek için ayrı bir test.db kullanılır.
const TEST_DB_PATH = path.join(__dirname, 'prisma', 'test.db');
const TEST_DATABASE_URL = 'file:./test.db';

function cleanup() {
  for (const f of [TEST_DB_PATH, `${TEST_DB_PATH}-journal`]) {
    if (existsSync(f)) unlinkSync(f);
  }
}

export async function setup() {
  cleanup();
  execSync('npx prisma migrate deploy', {
    cwd: __dirname,
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
    stdio: 'inherit',
  });
}

export async function teardown() {
  cleanup();
}
