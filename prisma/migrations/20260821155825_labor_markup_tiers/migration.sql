-- CreateTable
CREATE TABLE "LaborMarkupTier" (
    "id" TEXT NOT NULL,
    "minHours" DECIMAL(6,2) NOT NULL,
    "maxHours" DECIMAL(6,2),
    "multiplier" DECIMAL(6,3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LaborMarkupTier_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LaborMarkupTier_active_minHours_idx" ON "LaborMarkupTier"("active", "minHours");
