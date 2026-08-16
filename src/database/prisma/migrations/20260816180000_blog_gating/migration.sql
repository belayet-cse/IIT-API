-- AlterEnum
ALTER TYPE "PaymentType" ADD VALUE 'BLOG';

-- AlterTable: split single price into priceBdt/priceUsd, mirroring MembershipPlan's dual pricing
ALTER TABLE "blogs" RENAME COLUMN "price" TO "priceBdt";
ALTER TABLE "blogs" ADD COLUMN "priceUsd" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "payments" ADD COLUMN "blogId" TEXT;

-- CreateIndex
CREATE INDEX "payments_blogId_idx" ON "payments"("blogId");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "blogs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
