-- AlterTable
ALTER TABLE "blogs" ADD COLUMN     "metaKeywords" TEXT,
ADD COLUMN     "subCategory" TEXT;

-- CreateTable
CREATE TABLE "sub_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sub_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sub_categories_categoryId_sortOrder_idx" ON "sub_categories"("categoryId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "sub_categories_categoryId_name_key" ON "sub_categories"("categoryId", "name");

-- AddForeignKey
ALTER TABLE "sub_categories" ADD CONSTRAINT "sub_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
