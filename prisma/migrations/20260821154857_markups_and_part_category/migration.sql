-- CreateEnum
CREATE TYPE "PartCategory" AS ENUM ('PART', 'TIRE', 'BATTERY');

-- AlterTable
ALTER TABLE "Part" ADD COLUMN     "category" "PartCategory" NOT NULL DEFAULT 'PART';

-- CreateTable
CREATE TABLE "MarkupSettings" (
    "id" TEXT NOT NULL DEFAULT 'markups',
    "appliesToParts" BOOLEAN NOT NULL DEFAULT true,
    "appliesToTires" BOOLEAN NOT NULL DEFAULT false,
    "appliesToBatteries" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarkupSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarkupTier" (
    "id" TEXT NOT NULL,
    "minCost" DECIMAL(10,2) NOT NULL,
    "maxCost" DECIMAL(10,2),
    "multiplier" DECIMAL(6,3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarkupTier_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MarkupTier_active_minCost_idx" ON "MarkupTier"("active", "minCost");

-- CreateIndex
CREATE INDEX "Part_category_idx" ON "Part"("category");
