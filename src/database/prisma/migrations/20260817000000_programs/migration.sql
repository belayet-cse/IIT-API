-- AlterEnum
ALTER TYPE "PaymentType" ADD VALUE 'PROGRAM';

-- CreateEnum
CREATE TYPE "ProgramType" AS ENUM ('INTERNATIONAL', 'PROPRIETARY');

-- CreateTable
CREATE TABLE "programs" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "code" TEXT,
    "type" "ProgramType" NOT NULL,
    "overview" TEXT NOT NULL,
    "whoItsFor" TEXT,
    "examInfo" TEXT,
    "featuredImage" TEXT,
    "priceBdt" INTEGER NOT NULL DEFAULT 0,
    "priceUsd" INTEGER NOT NULL DEFAULT 0,
    "freeForBasic" BOOLEAN NOT NULL DEFAULT false,
    "freeForPro" BOOLEAN NOT NULL DEFAULT false,
    "freeForElite" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "status" "BlogStatus" NOT NULL DEFAULT 'DRAFT',
    "authorId" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program_modules" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "videoUrl" TEXT,
    "sequence" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "program_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enrollments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "payments" ADD COLUMN "programId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "programs_slug_key" ON "programs"("slug");

-- CreateIndex
CREATE INDEX "programs_status_idx" ON "programs"("status");

-- CreateIndex
CREATE INDEX "programs_type_idx" ON "programs"("type");

-- CreateIndex
CREATE INDEX "program_modules_programId_idx" ON "program_modules"("programId");

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_userId_programId_key" ON "enrollments"("userId", "programId");

-- CreateIndex
CREATE INDEX "enrollments_programId_idx" ON "enrollments"("programId");

-- CreateIndex
CREATE INDEX "payments_programId_idx" ON "payments"("programId");

-- AddForeignKey
ALTER TABLE "programs" ADD CONSTRAINT "programs_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_modules" ADD CONSTRAINT "program_modules_programId_fkey" FOREIGN KEY ("programId") REFERENCES "programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_programId_fkey" FOREIGN KEY ("programId") REFERENCES "programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_programId_fkey" FOREIGN KEY ("programId") REFERENCES "programs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
