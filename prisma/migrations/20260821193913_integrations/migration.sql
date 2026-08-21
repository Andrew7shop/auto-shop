-- CreateEnum
CREATE TYPE "IntegrationStatus" AS ENUM ('CONNECTED', 'DISCONNECTED');

-- CreateTable
CREATE TABLE "Integration" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "IntegrationStatus" NOT NULL DEFAULT 'DISCONNECTED',
    "apiKey" TEXT,
    "accountId" TEXT,
    "connectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Integration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Integration_name_key" ON "Integration"("name");

-- CreateIndex
CREATE INDEX "Integration_status_idx" ON "Integration"("status");

-- Seed the integrations the shop wants to use
INSERT INTO "Integration" ("id", "name", "description", "status", "createdAt", "updatedAt") VALUES
    ('integration_carfax', 'Carfax', 'Vehicle history reports', 'DISCONNECTED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('integration_partstech', 'PartsTech', 'Parts ordering and pricing', 'DISCONNECTED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('integration_siriusxm', 'SiriusXM', 'Satellite radio activation', 'DISCONNECTED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
