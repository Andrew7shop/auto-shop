-- RenameEnum: frees up the "JobCategory" name for the new table below
ALTER TYPE "JobCategory" RENAME TO "JobCategory_old_enum";

-- CreateTable
CREATE TABLE "JobCategory" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoSettings" (
    "id" TEXT NOT NULL DEFAULT 'ro',
    "defaultTaxRate" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "defaultDiscountType" "DiscountType" NOT NULL DEFAULT 'FIXED',
    "defaultDiscountValue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "defaultTireFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "gpPerHourGoal" DECIMAL(10,2),
    "invoiceNumberPrefix" TEXT,
    "invoiceNumberPadding" INTEGER NOT NULL DEFAULT 0,
    "enabledPaymentMethods" "PaymentMethod"[] DEFAULT ARRAY['CASH', 'CARD', 'CHECK', 'BANK_TRANSFER', 'OTHER']::"PaymentMethod"[],
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LaborRate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ratePerHour" DECIMAL(10,2) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LaborRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopFee" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "DiscountType" NOT NULL DEFAULT 'FIXED',
    "value" DECIMAL(10,2) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopFee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JobCategory_code_key" ON "JobCategory"("code");

-- CreateIndex
CREATE INDEX "JobCategory_active_sortOrder_idx" ON "JobCategory"("active", "sortOrder");

-- CreateIndex
CREATE INDEX "LaborRate_active_idx" ON "LaborRate"("active");

-- CreateIndex
CREATE INDEX "ShopFee_active_idx" ON "ShopFee"("active");

-- Seed JobCategory with the 6 existing enum values so in-use rows can be backfilled below
INSERT INTO "JobCategory" ("id", "code", "name", "active", "sortOrder", "createdAt", "updatedAt") VALUES
    ('jobcat_maintenance', 'MAINTENANCE', 'Maintenance', true, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('jobcat_repair', 'REPAIR', 'Repair', true, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('jobcat_tires', 'TIRES', 'Tires', true, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('jobcat_inspection', 'INSPECTION', 'Inspection', true, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('jobcat_diagnostic', 'DIAGNOSTIC', 'Diagnostic', true, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('jobcat_other', 'OTHER', 'Other', true, 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- AlterTable: add nullable categoryId columns alongside the still-present old enum columns
ALTER TABLE "WorkOrder" ADD COLUMN "categoryId" TEXT;
ALTER TABLE "CannedJob" ADD COLUMN "categoryId" TEXT;

-- Backfill categoryId from the old enum column before it's dropped
UPDATE "WorkOrder" SET "categoryId" = CASE "category"::text
    WHEN 'MAINTENANCE' THEN 'jobcat_maintenance'
    WHEN 'REPAIR' THEN 'jobcat_repair'
    WHEN 'TIRES' THEN 'jobcat_tires'
    WHEN 'INSPECTION' THEN 'jobcat_inspection'
    WHEN 'DIAGNOSTIC' THEN 'jobcat_diagnostic'
    WHEN 'OTHER' THEN 'jobcat_other'
    ELSE NULL
END;

UPDATE "CannedJob" SET "categoryId" = CASE "category"::text
    WHEN 'MAINTENANCE' THEN 'jobcat_maintenance'
    WHEN 'REPAIR' THEN 'jobcat_repair'
    WHEN 'TIRES' THEN 'jobcat_tires'
    WHEN 'INSPECTION' THEN 'jobcat_inspection'
    WHEN 'DIAGNOSTIC' THEN 'jobcat_diagnostic'
    WHEN 'OTHER' THEN 'jobcat_other'
    ELSE NULL
END;

-- DropIndex
DROP INDEX "CannedJob_category_active_idx";

-- DropIndex
DROP INDEX "WorkOrder_category_idx";

-- AlterTable: drop old enum columns now that data has been migrated
ALTER TABLE "CannedJob" DROP COLUMN "category";
ALTER TABLE "WorkOrder" DROP COLUMN "category";

-- DropEnum
DROP TYPE "JobCategory_old_enum";

-- CreateIndex
CREATE INDEX "CannedJob_categoryId_active_idx" ON "CannedJob"("categoryId", "active");

-- CreateIndex
CREATE INDEX "WorkOrder_categoryId_idx" ON "WorkOrder"("categoryId");

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "JobCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CannedJob" ADD CONSTRAINT "CannedJob_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "JobCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
