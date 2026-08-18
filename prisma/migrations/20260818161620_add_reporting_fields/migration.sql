-- CreateEnum
CREATE TYPE "JobCategory" AS ENUM ('MAINTENANCE', 'REPAIR', 'TIRES', 'INSPECTION', 'DIAGNOSTIC', 'OTHER');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENT', 'FIXED');

-- AlterEnum
ALTER TYPE "LineItemType" ADD VALUE 'FEE';

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "discountType" "DiscountType" NOT NULL DEFAULT 'FIXED',
ADD COLUMN     "discountValue" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "tireFeeTotal" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "LineItem" ADD COLUMN     "partId" TEXT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "paidAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "WorkOrder" ADD COLUMN     "category" "JobCategory" NOT NULL DEFAULT 'OTHER';

-- CreateIndex
CREATE INDEX "LineItem_partId_idx" ON "LineItem"("partId");

-- CreateIndex
CREATE INDEX "WorkOrder_category_idx" ON "WorkOrder"("category");

-- AddForeignKey
ALTER TABLE "LineItem" ADD CONSTRAINT "LineItem_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part"("id") ON DELETE SET NULL ON UPDATE CASCADE;
