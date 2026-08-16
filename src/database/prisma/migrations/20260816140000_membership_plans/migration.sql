-- AlterTable
ALTER TABLE "users" ADD COLUMN "membershipTier" "MembershipTier";
ALTER TABLE "users" ADD COLUMN "membershipExpiresAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "membership_plans" (
    "tier" "MembershipTier" NOT NULL,
    "displayName" TEXT NOT NULL,
    "priceBdt" INTEGER NOT NULL,
    "priceUsd" INTEGER NOT NULL,
    "discountPercent" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "membership_plans_pkey" PRIMARY KEY ("tier")
);

-- Seed default plans
INSERT INTO "membership_plans" ("tier", "displayName", "priceBdt", "priceUsd", "discountPercent", "updatedAt") VALUES
    ('BASIC', 'Basic', 2000, 25, 10, CURRENT_TIMESTAMP),
    ('PRO', 'Pro', 5000, 60, 25, CURRENT_TIMESTAMP),
    ('ELITE', 'Elite', 10000, 120, 40, CURRENT_TIMESTAMP);
