-- CreateEnum
CREATE TYPE "CustomerType" AS ENUM ('INDIVIDUAL', 'BUSINESS');

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "birthday" DATE,
ADD COLUMN     "businessName" TEXT,
ADD COLUMN     "customerType" "CustomerType" NOT NULL DEFAULT 'INDIVIDUAL',
ADD COLUMN     "sourceId" TEXT;

-- CreateTable
CREATE TABLE "CustomerSettings" (
    "id" TEXT NOT NULL DEFAULT 'customers',
    "requireCustomerType" BOOLEAN NOT NULL DEFAULT false,
    "requireBusinessName" BOOLEAN NOT NULL DEFAULT false,
    "requireAddress" BOOLEAN NOT NULL DEFAULT false,
    "requirePhone" BOOLEAN NOT NULL DEFAULT false,
    "requireEmail" BOOLEAN NOT NULL DEFAULT false,
    "requireSource" BOOLEAN NOT NULL DEFAULT false,
    "requireBirthday" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Customer_sourceId_idx" ON "Customer"("sourceId");

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "MarketingSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;
