-- CreateTable
CREATE TABLE "ShopProfile" (
    "id" TEXT NOT NULL DEFAULT 'shop',
    "name" TEXT NOT NULL DEFAULT '',
    "shopId" TEXT,
    "licenseNumber" TEXT,
    "taxId" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postalCode" TEXT,
    "phone" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopProfile_pkey" PRIMARY KEY ("id")
);
