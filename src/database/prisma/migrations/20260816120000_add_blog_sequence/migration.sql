-- AlterTable
ALTER TABLE "blogs" ADD COLUMN "sequence" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "blogs_category_sequence_idx" ON "blogs"("category", "sequence");
