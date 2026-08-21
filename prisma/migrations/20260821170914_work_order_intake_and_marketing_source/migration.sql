-- CreateEnum
CREATE TYPE "ArrivalType" AS ENUM ('WAITING', 'DROP_OFF', 'TOWED_IN');

-- AlterTable
ALTER TABLE "WorkOrder" ADD COLUMN     "arrivalType" "ArrivalType",
ADD COLUMN     "laborRateId" TEXT,
ADD COLUMN     "marketingSourceId" TEXT;

-- CreateTable
CREATE TABLE "MarketingSource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketingSource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MarketingSource_name_key" ON "MarketingSource"("name");

-- CreateIndex
CREATE INDEX "MarketingSource_active_sortOrder_idx" ON "MarketingSource"("active", "sortOrder");

-- CreateIndex
CREATE INDEX "WorkOrder_laborRateId_idx" ON "WorkOrder"("laborRateId");

-- CreateIndex
CREATE INDEX "WorkOrder_marketingSourceId_idx" ON "WorkOrder"("marketingSourceId");

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_laborRateId_fkey" FOREIGN KEY ("laborRateId") REFERENCES "LaborRate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_marketingSourceId_fkey" FOREIGN KEY ("marketingSourceId") REFERENCES "MarketingSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed the default marketing source list
INSERT INTO "MarketingSource" ("id", "name", "active", "sortOrder", "createdAt", "updatedAt") VALUES
    ('mktsrc_referral', 'Referral', true, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('mktsrc_friends_family', 'Friends/Family', true, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('mktsrc_returning_customer', 'Returning Customer', true, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('mktsrc_walk_in', 'Walk In', true, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('mktsrc_fleet', 'Fleet', true, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('mktsrc_employee', 'Employee', true, 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('mktsrc_email', 'Email', true, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('mktsrc_coupon_mailer', 'Coupon/Mailer', true, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('mktsrc_google', 'Google', true, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('mktsrc_facebook', 'Facebook', true, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('mktsrc_yelp', 'Yelp', true, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('mktsrc_radio', 'Radio', true, 11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
