-- AlterTable
ALTER TABLE "enrollments" ADD COLUMN "completedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "module_completions" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "module_completions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "module_completions_enrollmentId_moduleId_key" ON "module_completions"("enrollmentId", "moduleId");

-- AddForeignKey
ALTER TABLE "module_completions" ADD CONSTRAINT "module_completions_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_completions" ADD CONSTRAINT "module_completions_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "program_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
