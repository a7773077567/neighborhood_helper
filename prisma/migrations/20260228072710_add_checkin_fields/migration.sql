-- Step 1: 加欄位（qrToken 先設為 nullable，因為舊記錄還沒有值）
ALTER TABLE "Registration" ADD COLUMN "qrToken" TEXT;
ALTER TABLE "Registration" ADD COLUMN "attended" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Registration" ADD COLUMN "attendedAt" TIMESTAMP(3);

-- Step 2: 幫舊記錄補上 qrToken（用 PostgreSQL 內建的 UUID 函式）
UPDATE "Registration" SET "qrToken" = gen_random_uuid() WHERE "qrToken" IS NULL;

-- Step 3: qrToken 改成 NOT NULL + UNIQUE（現在所有記錄都有值了，安全）
ALTER TABLE "Registration" ALTER COLUMN "qrToken" SET NOT NULL;
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_qrToken_key" UNIQUE ("qrToken");
