-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('SUCCEEDED', 'DECLINED');

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "status" "PaymentStatus" NOT NULL DEFAULT 'SUCCEEDED';

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");
