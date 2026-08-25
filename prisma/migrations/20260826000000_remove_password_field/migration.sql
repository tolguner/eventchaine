-- AlterTable
-- Giriş yalnızca cüzdanla yapılıyor; password alanı hiç kullanılmıyordu.
ALTER TABLE "User" DROP COLUMN "password";
