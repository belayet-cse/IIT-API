-- AlterEnum
ALTER TYPE "PaymentType" ADD VALUE 'RESEARCH';

-- CreateTable
CREATE TABLE "research_papers" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "abstract" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "featuredImage" TEXT,
    "category" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "BlogStatus" NOT NULL DEFAULT 'DRAFT',
    "priceBdt" INTEGER NOT NULL DEFAULT 0,
    "priceUsd" INTEGER NOT NULL DEFAULT 0,
    "certification" "Certification",
    "readingTime" INTEGER NOT NULL DEFAULT 1,
    "views" INTEGER NOT NULL DEFAULT 0,
    "authorId" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "research_papers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "research_papers_slug_key" ON "research_papers"("slug");

-- CreateIndex
CREATE INDEX "research_papers_status_idx" ON "research_papers"("status");

-- CreateIndex
CREATE INDEX "research_papers_publishedAt_idx" ON "research_papers"("publishedAt");

-- AlterTable
ALTER TABLE "payments" ADD COLUMN "paperId" TEXT;

-- CreateIndex
CREATE INDEX "payments_paperId_idx" ON "payments"("paperId");

-- AddForeignKey
ALTER TABLE "research_papers" ADD CONSTRAINT "research_papers_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_paperId_fkey" FOREIGN KEY ("paperId") REFERENCES "research_papers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
