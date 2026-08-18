-- CreateTable
CREATE TABLE "CannedJob" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "JobCategory" NOT NULL DEFAULT 'OTHER',
    "description" TEXT,
    "laborHours" DECIMAL(6,2),
    "price" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CannedJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CannedJob_category_active_idx" ON "CannedJob"("category", "active");

-- CreateIndex
CREATE INDEX "CannedJob_name_idx" ON "CannedJob"("name");
