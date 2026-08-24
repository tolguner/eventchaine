-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL DEFAULT '',
    "student_no" TEXT,
    "department" TEXT,
    "class_year" INTEGER,
    "role" TEXT NOT NULL DEFAULT 'user',
    "walletAddress" TEXT,
    "wallet_connected_at" DATETIME,
    "primary_wallet_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "address" TEXT NOT NULL,
    "wallet_type" TEXT NOT NULL DEFAULT 'Unknown',
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "user_id" TEXT NOT NULL,
    "connected_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_used_at" DATETIME,
    CONSTRAINT "Wallet_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires_at" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "start_at" DATETIME NOT NULL,
    "end_at" DATETIME NOT NULL,
    "location" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "price" REAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'FREE',
    "tags" TEXT NOT NULL DEFAULT '[]',
    "cover_url" TEXT NOT NULL DEFAULT '',
    "created_by" TEXT NOT NULL,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Event_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Registration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'confirmed',
    "ticket_code" TEXT NOT NULL,
    "qr_payload" TEXT NOT NULL,
    "payment_tx_hash" TEXT,
    "payment_amount" REAL,
    "payment_currency" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Registration_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Registration_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CheckIn" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "method" TEXT NOT NULL DEFAULT 'qr',
    "device_hash" TEXT NOT NULL DEFAULT '',
    "verifier_id" TEXT,
    "checkin_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CheckIn_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CheckIn_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "certificate_no" TEXT NOT NULL,
    "ipfs_cid" TEXT NOT NULL DEFAULT '',
    "chain" TEXT NOT NULL DEFAULT 'Sui Testnet',
    "contract_address" TEXT NOT NULL DEFAULT '0x0',
    "token_id" TEXT NOT NULL DEFAULT '',
    "tx_hash" TEXT NOT NULL DEFAULT '',
    "minted_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" DATETIME,
    CONSTRAINT "Certificate_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Certificate_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "cover_url" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT 'Genel',
    "author" TEXT NOT NULL DEFAULT 'IT&MIS Kulübü',
    "views" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_walletAddress_key" ON "User"("walletAddress");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_address_key" ON "Wallet"("address");

-- CreateIndex
CREATE INDEX "Wallet_user_id_idx" ON "Wallet"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_token_idx" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_user_id_idx" ON "Session"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");

-- CreateIndex
CREATE INDEX "Event_slug_idx" ON "Event"("slug");

-- CreateIndex
CREATE INDEX "Event_start_at_idx" ON "Event"("start_at");

-- CreateIndex
CREATE UNIQUE INDEX "Registration_ticket_code_key" ON "Registration"("ticket_code");

-- CreateIndex
CREATE INDEX "Registration_event_id_idx" ON "Registration"("event_id");

-- CreateIndex
CREATE INDEX "Registration_ticket_code_idx" ON "Registration"("ticket_code");

-- CreateIndex
CREATE UNIQUE INDEX "Registration_user_id_event_id_key" ON "Registration"("user_id", "event_id");

-- CreateIndex
CREATE INDEX "CheckIn_event_id_idx" ON "CheckIn"("event_id");

-- CreateIndex
CREATE UNIQUE INDEX "CheckIn_user_id_event_id_key" ON "CheckIn"("user_id", "event_id");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_certificate_no_key" ON "Certificate"("certificate_no");

-- CreateIndex
CREATE INDEX "Certificate_certificate_no_idx" ON "Certificate"("certificate_no");

-- CreateIndex
CREATE INDEX "Certificate_tx_hash_idx" ON "Certificate"("tx_hash");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_user_id_event_id_key" ON "Certificate"("user_id", "event_id");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");

-- CreateIndex
CREATE INDEX "BlogPost_slug_idx" ON "BlogPost"("slug");
