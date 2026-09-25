-- CreateTable
CREATE TABLE "notices" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "href" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notices_sortOrder_idx" ON "notices"("sortOrder");
