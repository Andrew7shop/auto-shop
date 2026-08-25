-- AlterTable
ALTER TABLE "RoSettings" ADD COLUMN     "showDigitalSignature" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showJobCategory" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showMarketingSource" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showOdometerInOut" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showPartsBilling" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showPartsPurchaseOrder" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showPaymentCardType" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showTechOnLabor" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showTireDotCodes" BOOLEAN NOT NULL DEFAULT true;
