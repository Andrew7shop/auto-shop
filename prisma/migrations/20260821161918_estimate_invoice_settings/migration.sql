-- CreateTable
CREATE TABLE "EstimateInvoiceSettings" (
    "id" TEXT NOT NULL DEFAULT 'estimates-invoices',
    "fieldVisibility" JSONB NOT NULL DEFAULT '{}',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EstimateInvoiceSettings_pkey" PRIMARY KEY ("id")
);
