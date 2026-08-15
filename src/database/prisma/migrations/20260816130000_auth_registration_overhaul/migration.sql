-- CreateEnum
CREATE TYPE "MembershipTier" AS ENUM ('BASIC', 'PRO', 'ELITE');

-- CreateEnum
CREATE TYPE "AlumniVerificationStatus" AS ENUM ('NONE', 'PENDING', 'VERIFIED');

-- AlterEnum: USER -> GENERAL, then add PREMIUM/RESEARCHER
ALTER TYPE "Role" RENAME VALUE 'USER' TO 'GENERAL';
ALTER TYPE "Role" ADD VALUE 'PREMIUM';
ALTER TYPE "Role" ADD VALUE 'RESEARCHER';

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'GENERAL';
ALTER TABLE "users" ADD COLUMN "mustChangePassword" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "alumniVerificationStatus" "AlumniVerificationStatus" NOT NULL DEFAULT 'NONE';
ALTER TABLE "users" ADD COLUMN "desiredMembershipTier" "MembershipTier";

-- CreateTable
CREATE TABLE "researcher_applications" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "currentRole" TEXT NOT NULL,
    "certifications" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "expertiseAreas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "bio" TEXT NOT NULL,
    "linkedinUrl" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "reviewNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "researcher_applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "researcher_applications_status_idx" ON "researcher_applications"("status");
